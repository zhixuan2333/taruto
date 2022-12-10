import { Server } from "socket.io";
import * as c from "./contro";
import type { Game } from "../lib/socket";

// Got port form env
const port = parseInt(process.env.PORT || "", 10) || 8080;

const io = new Server(port, {
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
        Games.set(GameIndex, c.gameCreate(GameIndex));
    }

    // if game players more than 4, disconnect
    if (Games.get(GameIndex)!.players.length > 3) {
        return;
    }
    const sync = () => { io.to(GameIndex).emit("update", Games.get(GameIndex)); }

    // if game players less than 4, join game
    Games.set(GameIndex, c.playerJoin(Games.get(GameIndex)!, socket.id, "test"));

    // send game data
    sync();

    // sync game data every event
    socket.onAny(() => {
        sync()
    });

    socket.on("start", () => {
        console.log("start");
        c.start(Games.get(GameIndex)!);
        sync();
    });

    socket.on("roll", () => {
        Games.set(GameIndex, c.roll(Games.get(GameIndex)!));
        sync();
        io.to(GameIndex).emit("roll", Games.get(GameIndex));

        // State 100 -> 101
        // Games.set(GameIndex, c.ChangeState(Games.get(GameIndex)!, 101));
    });

    socket.on("disconnect", () => {
        // remove player
        socket.leave(GameIndex);
        Games.set(GameIndex, c.playerLeave(Games.get(GameIndex)!, socket.id));
        sync();

        console.log("user disconnected");
    });
});

io.on("disconnect", (socket) => {
    socket.leave("room1");

    // maybe not use
    // delete Games.delete[socket.id];
    // if (
    //     Games["0"].nowUser !== null &&
    //     Games["0"].nowUser.socketID == socket.id
    // ) {
    //     Games["0"].nowUser = null;
    // }
    console.log("user disconnected");
});

