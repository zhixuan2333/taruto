import { Server } from "socket.io";

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

type Room = {
    id: string;
    name: string;
    users: User[];
    koma: Koma[];
};

type User = {
    // 0~3
    id: number;
    socketID: string;
    name: string;
};

type Koma = {
    // 0~3
    owner: number;
    // 0~15
    id: number;
    // the Masu id 0~71
    position: number;
    isGoal: boolean;
};

const rooms: Room[] = [];

rooms.push({
    id: "1",
    name: "room1",
    users: [],
    koma: [],
});

io.on("connection", (socket) => {
    // ...
    console.log("a user connected");
    socket.join("room1");

    rooms[0].users.push({
        id: 0,
        socketID: socket.id,
        name: "user1",
    });
    socket.emit("message", "Hello there!");
    io.to("room1").emit("message", "Hello everyone!");
});

io.on("disconnect", () => {
    // ...
    console.log("user disconnected");
});
