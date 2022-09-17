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
    nowUser: User | null;
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
    if (io.in("room1").allSockets.length >= 4) {
        console.log("room1 is full");
        socket.emit("message", "the room is full");
        socket.disconnect();
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
