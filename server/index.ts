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

const DefaultKoma: ioKoma[] = [
    { owner: 0, id: 0, position: 14, isGoal: false },
    { owner: 0, id: 1, position: 15, isGoal: false },
    { owner: 0, id: 2, position: 16, isGoal: false },
    { owner: 0, id: 3, position: 17, isGoal: false },
    { owner: 1, id: 4, position: 32, isGoal: false },
    { owner: 1, id: 5, position: 33, isGoal: false },
    { owner: 1, id: 6, position: 34, isGoal: false },
    { owner: 1, id: 7, position: 35, isGoal: false },
    { owner: 2, id: 8, position: 50, isGoal: false },
    { owner: 2, id: 9, position: 51, isGoal: false },
    { owner: 2, id: 10, position: 52, isGoal: false },
    { owner: 2, id: 11, position: 53, isGoal: false },
    { owner: 3, id: 12, position: 68, isGoal: false },
    { owner: 3, id: 13, position: 69, isGoal: false },
    { owner: 3, id: 14, position: 70, isGoal: false },
    { owner: 3, id: 15, position: 71, isGoal: false },
];

const rooms: ioGame[] = [];

rooms.push({
    id: "1",
    name: "room1",
    users: [],
    koma: DefaultKoma,
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

    socket.on("disconnect", () => {
        socket.leave("room1");
        rooms[0] = {
            ...rooms[0],
            users: rooms[0].users.filter((user) => user.socketID != socket.id),
            nowUser:
                rooms[0].nowUser?.socketID == socket.id
                    ? rooms[0].users[0]
                    : rooms[0].nowUser,
        };
        io.to("room1").emit("update", rooms[0]);
        console.log("user disconnected");
    });
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
