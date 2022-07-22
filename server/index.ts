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

io.on("connection", (socket) => {
    // ...
    console.log("a user connected");
});

io.on("disconnect", () => {
    // ...
    console.log("user disconnected");
});
