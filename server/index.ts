import { Server } from "socket.io";
import { gameCreate, playerJoin, playerLeave } from "./contro";
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
        Games.set(GameIndex, gameCreate(GameIndex));
        return;
    }

    // if game players more than 4, disconnect
    if (Games.get(GameIndex)!.players.length > 3) {
        return;
    }

    // if game players less than 4, join game
    Games.set(GameIndex, playerJoin(Games.get(GameIndex)!, socket.id, "test"));

    // send game data
    io.to(GameIndex).emit("update", Games.get(GameIndex));

    socket.on("start", () => {
        console.log("start");
    });

    socket.on("disconnect", () => {
        // remove player
        socket.leave(GameIndex);
        Games.set(GameIndex, playerLeave(Games.get(GameIndex)!, socket.id));
        io.to(GameIndex).emit("update", Games.get(GameIndex));

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
