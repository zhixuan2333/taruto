import { Server } from "socket.io";
import * as THREE from "three";
import { gameCreate, playerJoin, playerLeave } from "./contro";

const io = new Server(8080, {
    /* options */
    cors: {
        origin: "*",
        methods: "GET,PUT,POST,DELETE",
        allowedHeaders:
            "Content-Type, Authorization, X-Requested-With, X-Socket-ID",
        credentials: true,
    },
});

console.log("Server started on port 8080");

type Masu = {
    id: number;

    Position: THREE.Vector3;
    GoalPlayer: number;

    // 0: normal, 1: goal, 2: turn 3: spawn
    _type: number;

    // 連結管理
    _prev: number | null;
    _next: number | null;
    _nextForGoal: number | null;
};

type Player = {
    // 0~3
    id: number;
    socketID: string;
    name: string;
    // _beginMasu: Masu | null;
    // _endMasu: Masu | null;
    // _spawnMasu: Masu | null;
};

type Koma = {
    // 0~3
    owner: number;
    // 0~15
    id: number;
    _beginMasu: number | null;
    _endMasu: number | null;
    _spawnMasu: number;
    Position: number;
    isGoal: boolean;
};

type Game = {
    id: string;
    name: string;
    players: Player[];
    masus: Masu[];
    koma: Koma[];
    nowUser: Player | null;
};

export { Masu, Player, Koma, Game };

const Games = new Map<string, Game>();

io.on("connection", (socket) => {
    console.log("a user connected");

    // for Debug
    socket.rooms.forEach((room) => {
        console.log(room);
    });

    socket.join("000-000-000");
    // if user more than 4, disconnect
    if (socket.rooms.size > 3) {
        return;
    }

    // find game index
    let GameIndex = "000-000-000";

    // if game not found, create game
    if (!Games.has(GameIndex)) {
        Games.set(GameIndex, gameCreate(GameIndex));
        return;
    }

    // if game players more than 4, disconnect
    if (Games[GameIndex].players.length > 3) {
        return;
    }

    // if game players less than 4, join game
    Games.set(GameIndex, playerJoin(Games[GameIndex], socket.id, "test"));

    // send game data
    io.to(GameIndex).emit("update", Games[GameIndex]);

    socket.on("start", () => {
        console.log("start");
    });

    socket.on("disconnect", () => {
        // remove player
        socket.leave(GameIndex);
        Games.set(GameIndex, playerLeave(Games[GameIndex], socket.id));
        io.to(GameIndex).emit("update", Games[GameIndex]);

        console.log("user disconnected");
    });
});

io.on("disconnect", (socket) => {
    socket.leave("room1");
    delete Games[0].players[socket.id];
    if (Games[0].nowUser !== null && Games[0].nowUser.socketID == socket.id) {
        Games[0].nowUser = null;
    }
    console.log("user disconnected");
});
