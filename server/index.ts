import { Server } from "socket.io";
import * as THREE from "three";

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

const Games: Game[] = [];

type setupProps = {
    Masus: Masu[];
    Komas: Koma[];
};

function setup(): setupProps {
    const Masus: Masu[] = [];
    const Komas: Koma[] = [];
    let mapPosition: THREE.Vector3[] = [
        // 左下を0,0にする
        // turn point
        new THREE.Vector3(5, 0, 0),
        // Goal Masu
        new THREE.Vector3(5, 0, 1),
        new THREE.Vector3(5, 0, 2),
        new THREE.Vector3(5, 0, 3),
        new THREE.Vector3(5, 0, 4),
        // normal
        new THREE.Vector3(4, 0, 0),
        new THREE.Vector3(4, 0, 1),
        new THREE.Vector3(4, 0, 2),
        new THREE.Vector3(4, 0, 3),
        new THREE.Vector3(4, 0, 4),
        new THREE.Vector3(3, 0, 4),
        new THREE.Vector3(2, 0, 4),
        new THREE.Vector3(1, 0, 4),
        new THREE.Vector3(0, 0, 4),
        // spawn
        new THREE.Vector3(1, 0, 1),
        new THREE.Vector3(2, 0, 1),
        new THREE.Vector3(1, 0, 2),
        new THREE.Vector3(2, 0, 2),
    ];
    const playerCount: number = 4;
    const masuCount: number = 18;
    const size: number = 10;
    for (let i = 0; i < playerCount; i++) {
        const masuBeginIndex = Masus.length;

        let rawPostion: THREE.Vector3[] = [];

        switch (i) {
            default:
                rawPostion = mapPosition;
                break;

            case 1: {
                rawPostion = mapPosition.map((v) => {
                    const v2 = v.clone();
                    v2.x = v.z;
                    v2.z = v.x;
                    v2.z *= -1;
                    v2.z += size;
                    return v2;
                });
                break;
            }

            case 2: {
                rawPostion = mapPosition.map((v) => {
                    const v2 = v.clone();
                    v2.x *= -1;
                    v2.z *= -1;
                    v2.x += size;
                    v2.z += size;
                    return v2;
                });
                break;
            }

            case 3: {
                rawPostion = mapPosition.map((v) => {
                    const v2 = v.clone();
                    v2.x = v.z;
                    v2.z = v.x;
                    v2.x *= -1;
                    v2.x += size;
                    return v2;
                });
                break;
            }
        }
        for (let j = 0; j < masuCount; j++) {
            // const masu: Masu = new Masu(masuBeginIndex + j, rawPostion[j], 1);
            const masu: Masu = {
                id: masuBeginIndex + j,
                Position: rawPostion[j],
                GoalPlayer: i,
                _type: 0,
                _prev: null,
                _next: null,
                _nextForGoal: null,
            };

            // Masu type
            if (j === 0) {
                // turn
                masu._type = 2;
            } else if (j <= 4) {
                // goal
                masu._type = 1;
            } else if (j <= 13) {
                // normal
                masu._type = 0;
            } else if (j <= 17) {
                // spawn
                masu._type = 3;
            }

            // 普通の Masu は-1
            if (j <= 4 && j >= 1) {
                masu.GoalPlayer = i - 1;
                if (i === 0) {
                    masu.GoalPlayer = 3;
                }
            } else {
                masu.GoalPlayer = -1;
            }

            Masus.push(masu);
        }

        // 連結管理
        for (let i = 0; i < 9; i++) {
            Masus[masuBeginIndex + 13 - i]._next = masuBeginIndex + 12 - i;
        }
        Masus[masuBeginIndex + 5]._next = masuBeginIndex;
        for (let i = 0; i < 3; i++) {
            Masus[masuBeginIndex + 1 + i]._next = masuBeginIndex + 2 + i;
        }
        // 14~17
        for (let i = 0; i < 4; i++) {
            Masus[masuBeginIndex + i + 14]._next = masuBeginIndex + 13;
        }

        // _nextForGoal
        Masus[masuBeginIndex + 0]._nextForGoal = masuBeginIndex + 1;

        // Komas
        for (let k = 0; k < 4; k++) {
            // _allKoma.push(new Koma(_allMasu[masuBeginIndex + 14 + k], i));
            Komas.push({
                id: i * 4 + k,
                isGoal: false,
                owner: i,
                _spawnMasu: masuBeginIndex + 14 + k,
                _beginMasu: null,
                _endMasu: null,
                Position: masuBeginIndex + 14 + k,
            });
        }

        // start, end, spawn Masu for player
        // const player: Player = {
        //     _beginMasu: Masus[masuBeginIndex],
        //     _endMasu: Masus[masuBeginIndex + masuCount - 1],
        //     _spawnMasu: Masus[masuBeginIndex + 5],
        // };
    }
    for (let i = 1; i <= 3; i++) {
        Masus[i * 18]._next = i * 18 - 4 - 1;
    }
    Masus[0]._next = 67;
    return { Masus, Komas };
}

const { Masus, Komas } = setup();

Games.push({
    id: "1",
    name: "room1",
    players: [],
    masus: Masus,
    koma: Komas,
    nowUser: null,
});

io.on("connection", (socket) => {
    console.log("a user connected");

    // for Debug
    socket.rooms.forEach((room) => {
        console.log(room);
    });

    // if user more than 4, disconnect
    if (socket.rooms.size > 3) {
        return;
    }
    if (Games[0].players.length > 3) {
        return;
    }

    socket.join("room1");
    Games[0] = {
        ...Games[0],
        players: [
            ...Games[0].players,
            {
                id: Games[0].players.length,
                socketID: socket.id,
                name: "user " + Games[0].players.length,
                // _beginMasu: null,
                // _endMasu: null,
                // _spawnMasu: null,
            },
        ],
        nowUser:
            Games[0].nowUser == null ? Games[0].players[0] : Games[0].nowUser,
    };
    Games[0].koma.forEach((koma) => {
        if (koma.id === 4) {
            if (Games[0].masus[koma.Position]._next !== null) {
                koma.Position = Games[0].masus[koma.Position]._next!;
            }
        }
    });
    socket.emit("message", "Hello there!");
    io.to("room1").emit("update", Games[0]);

    socket.on("disconnect", () => {
        socket.leave("room1");
        Games[0] = {
            ...Games[0],
            players: Games[0].players.filter(
                (user) => user.socketID != socket.id
            ),
            nowUser:
                Games[0].nowUser?.socketID == socket.id
                    ? Games[0].players[0]
                    : Games[0].nowUser,
        };
        io.to("room1").emit("update", Games[0]);
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
