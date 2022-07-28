import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { Effects, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";

function Box(props: JSX.IntrinsicElements["mesh"]) {
    const ref = useRef<THREE.Mesh>(null!);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);
    useFrame((state, delta) => (ref.current.rotation.x += 0.01));
    return (
        <mesh
            {...props}
            ref={ref}
            scale={clicked ? 1.5 : 1}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}
        >
            <boxGeometry args={[2, 2, 1]} />
            <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
        </mesh>
    );
}

class Masu {
    // public GameObject = new THREE.Mesh(
    //     new THREE.BoxGeometry(1, 1, 1),
    //     new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    // );

    // public GameObject: THREE.Mesh;
    public Position: THREE.Vector3;
    public GoalPlayer: number;

    // 連結管理
    public _prev: Masu | null;
    public _next: Masu | null;
    public _nextForGoal: Masu | null;
    constructor(
        // gameObject: THREE.Mesh,
        position: THREE.Vector3,
        goalPlayer: number
    ) {
        this.Position = position;
        this.GoalPlayer = goalPlayer;
        this._prev = null;
        this._next = null;
        this._nextForGoal = null;
    }
}

class Player {
    // public Masu: Masu;
    public _beginMasu: Masu | null;
    public _endMasu: Masu | null;
    public _spawnMasu: Masu | null;
    constructor(
        beginMasu: Masu | null,
        endMasu: Masu | null,
        spawnMasu: Masu | null
    ) {
        this._beginMasu = beginMasu;
        this._endMasu = endMasu;
        this._spawnMasu = spawnMasu;
    }
}

// const socket = io("127.0.0.1:8080");

function App() {
    let _allMasu: Masu[] = [];
    const mapPosition: THREE.Vector3[] = [
        // 左下を0,0にする
        // turn point
        new Vector3(5, 0, 0),

        // Goal Masu
        new Vector3(5, 0, 1),
        new Vector3(5, 0, 2),
        new Vector3(5, 0, 3),
        new Vector3(5, 0, 4),

        // normal
        new Vector3(4, 0, 0),
        new Vector3(4, 0, 1),
        new Vector3(4, 0, 2),
        new Vector3(4, 0, 3),
        new Vector3(4, 0, 4),

        new Vector3(3, 0, 4),
        new Vector3(2, 0, 4),
        new Vector3(1, 0, 4),
        new Vector3(0, 0, 4),
        // spawn
        new Vector3(1, 0, 1),
        new Vector3(2, 0, 1),
        new Vector3(1, 0, 2),
        new Vector3(2, 0, 2),
    ];
    const playerCount: number = 4;
    const masuCount: number = 15;

    const indexToheta: number = (2.0 * Math.PI) / masuCount;
    const thetaForBasePostionOfs: number = Math.PI / 4.0;
    for (let i = 0; i < playerCount; i++) {
        const thetaForBaseRot = i * indexToheta;
        const thetaForBasePostion = thetaForBasePostionOfs - thetaForBaseRot;

        const player = new Player(null, null, null);

        const masuBeginIndex = _allMasu.length;
        for (let j = 0; j < masuCount; j++) {
            const masu = new Masu(mapPosition[j], 1);

            // 普通の Masu は-1
            masu.GoalPlayer = i <= j && j <= 4 ? i : -1;
            _allMasu.push(masu);
        }

        //連結管理
        _allMasu[masuBeginIndex + 0]._next = _allMasu[masuBeginIndex + 5];
        _allMasu[masuBeginIndex + 1]._next = _allMasu[masuBeginIndex + 2];
        _allMasu[masuBeginIndex + 2]._next = _allMasu[masuBeginIndex + 3];
        _allMasu[masuBeginIndex + 3]._next = _allMasu[masuBeginIndex + 4];
        // 5~12
        for (let i = 0; i < 7; i++) {
            _allMasu[masuBeginIndex + i + 5]._next =
                _allMasu[masuBeginIndex + i + 6];
        }
        //_nextForGoal
        _allMasu[masuBeginIndex + 0]._nextForGoal =
            _allMasu[masuBeginIndex + 1];

        // start, end, spawn Masu for player
        player._beginMasu = _allMasu[masuBeginIndex];
        player._endMasu = _allMasu[masuBeginIndex + masuCount - 1];
        player._spawnMasu = _allMasu[masuBeginIndex + 5];
    }
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <Canvas>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <Box position={[-1.2, 1, 0]} />
                <Box position={[1.2, 0, 0]} />
                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
}

export default App;
