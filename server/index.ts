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

type ioGame = {
    id: string;
    name: string;
    users: ioPlayer[];
    koma: ioKoma[];
    nowUser: ioPlayer | null;
};

type ioPlayer = {
    // 0~3
    id: number;
    socketID: string;
    name: string;
};

type ioKoma = {
    // 0~3
    owner: number;
    // 0~15
    id: number;
    // the Masu id 0~71
    position: number;
    isGoal: boolean;
};

const rooms: ioGame[] = [];

rooms.push({
    id: "1",
    name: "room1",
    users: [],
    koma: [],
    nowUser: null,
});

io.on("connection", (socket) => {
    // ...
    console.log("a user connected");

    // for Debug
    socket.rooms.forEach((room) => {
        console.log(room);
    });

    // if user more than 4, disconnect
    if (socket.rooms.size > 4) {
        return;
    }
    if (rooms[0].users.length > 4) {
        return;
    }

    socket.join("room1");
    rooms[0] = {
        ...rooms[0],
        users: [
            ...rooms[0].users,
            {
                id: rooms[0].users.length,
                socketID: socket.id,
                name: "user " + rooms[0].users.length,
            },
        ],
        nowUser:
            rooms[0].nowUser == null ? rooms[0].users[0] : rooms[0].nowUser,
    };
    socket.emit("message", "Hello there!");
    io.to("room1").emit("update", rooms[0]);
});

io.on("disconnect", (socket) => {
    socket.leave("room1");
    delete rooms[0].users[socket.id];
    if (rooms[0].nowUser !== null && rooms[0].nowUser.socketID == socket.id) {
        rooms[0].nowUser = null;
    }
    // ...
    console.log("user disconnected");
});
