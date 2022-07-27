import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

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

// class Masu {
//     // public GameObject = new THREE.Mesh(
//     //     new THREE.BoxGeometry(1, 1, 1),
//     //     new THREE.MeshBasicMaterial({ color: 0x00ff00 })
//     // );

//     public GameObject: THREE.Mesh;
//     public Position: THREE.Vector3;
//     public GoalPlayer: number;

//     // 連結管理
//     public _prev: Masu;
//     public _next: Masu;
//     public _nextForGoal: Masu;
//     constructor(
//         gameObject: THREE.Mesh,
//         position: THREE.Vector3,
//         goalPlayer: number
//     ) {
//         this.Position = position;
//         this.GoalPlayer = goalPlayer;
//         this._prev = null;
//         this._next = null;
//         this._nextForGoal = null;
//     }
// }

// class Player {
//     // public Masu: Masu;
//     public _begainMasu: Masu;
//     public _endMasu: Masu;
//     public _spawnMasu: Masu;
//     constructor(beginMasu: Masu, endMasu: Masu, spawnMasu: Masu) {
//         this._begainMasu = beginMasu;
//         this._endMasu = endMasu;
//         this._spawnMasu = spawnMasu;
//     }
// }

// const socket = io("127.0.0.1:8080");

function App() {
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
