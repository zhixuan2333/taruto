import React, { Suspense, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import { Canvas, useLoader } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { TextureLoader } from 'three/src/loaders/TextureLoader.js'
import { a, useSpring } from "@react-spring/three";
import type { Game, Koma, Masu } from "../lib/socket";

type MapProps = {
    temp: THREE.Object3D;
    allMasu: Masu[];
};

function Maps({ temp, allMasu }: MapProps) {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const shaderRef = useRef<THREE.MeshPhongMaterial>(null!);
    useEffect(() => {
        // Set positions
        for (let i = 0; i < allMasu.length; i++) {
            temp.position.set(
                allMasu[i].Position.x,
                allMasu[i].Position.y,
                allMasu[i].Position.z
            );
            temp.updateMatrix();

            ref.current.setMatrixAt(i, temp.matrix);

            switch (allMasu[i]._type) {
                case 0: {
                    ref.current.setColorAt(i, new THREE.Color(0x00ff00));
                    break;
                }
                case 1: {
                    ref.current.setColorAt(i, new THREE.Color(0xff0000));
                    break;
                }
                case 2: {
                    ref.current.setColorAt(i, new THREE.Color(0x0000ff));
                    break;
                }
                case 3: {
                    ref.current.setColorAt(i, new THREE.Color(0xffff00));
                    break;
                }
            }
        }
        // Update the instance
        ref.current.instanceMatrix.needsUpdate = true;
    }, [allMasu, temp]);
    return (
        <instancedMesh ref={ref} args={[undefined, undefined, allMasu.length]}>
            <boxGeometry args={[0.8, 0.1, 0.8]} />
            <meshPhongMaterial ref={shaderRef} />
        </instancedMesh>
    );
}

type KomaProps = {
    temp: THREE.Object3D;
    allMasu: Masu[];
    allKoma: Koma[];
};
function Komas({ temp, allMasu, allKoma }: KomaProps) {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const shaderRef = useRef<THREE.MeshPhongMaterial>(null!);
    useEffect(() => {
        // Set positions
        for (let i = 0; i < allKoma.length; i++) {
            temp.position.set(
                allMasu[allKoma[i].Position].Position.x,
                0.2,
                allMasu[allKoma[i].Position].Position.z
            );
            temp.updateMatrix();

            ref.current.setMatrixAt(i, temp.matrix);

            switch (allKoma[i].owner) {
                case 0: {
                    ref.current.setColorAt(i, new THREE.Color(0x00ff00));
                    ref.current.material = new THREE.MeshPhongMaterial({ color: new THREE.Color(7, 0, 0.5), toneMapped: false });
                    break;
                }
                case 1: {
                    ref.current.setColorAt(i, new THREE.Color(0xff0000));
                    break;
                }
                case 2: {
                    ref.current.setColorAt(i, new THREE.Color(0x0000ff));
                    break;
                }
                case 3: {
                    ref.current.setColorAt(i, new THREE.Color(0xffff00));
                    break;
                }
            }
        }
        // Update the instance
        ref.current.instanceMatrix.needsUpdate = true;
    }, [allKoma, allMasu, temp]);

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, allKoma.length]}>
            <boxGeometry args={[0.4, 0.1, 0.4]} />
            <meshPhongMaterial ref={shaderRef} />
        </instancedMesh>
    );
}


type Props = {
    g: Game
};

function Cube({ g }: Props) {
    // loading textures
    const [texture_1, texture_2, texture_3, texture_4, texture_5, texture_6] = useLoader(TextureLoader, [
        '/textures/dice_1.jpeg',
        '/textures/dice_2.jpeg',
        '/textures/dice_3.jpeg',
        '/textures/dice_4.jpeg',
        '/textures/dice_5.jpeg',
        '/textures/dice_6.jpeg',
    ]);
    const random = (): number => { return Math.random() * 4 * Math.PI }

    const [style, api] = useSpring(() => ({
        rotationX: 1 * Math.PI,
        rotationY: 0 * Math.PI,
        rotationZ: 0.5 * Math.PI,
        scale: 1,
    }))

    useEffect(() => {
        const Faces = new Map<number, number[]>();
        Faces.set(1, [0, 0, 0.5])
        Faces.set(2, [0, 0, 1])
        Faces.set(3, [0.5, 1, 0])
        Faces.set(4, [0.5, 0, 0])
        Faces.set(5, [0, 0, 0])
        Faces.set(6, [1, 0, 0.5])

        api.start({
            to: [{
                rotationX: random(),
                rotationY: random(),
                rotationZ: random(),
                scale: 1.5,
            }, {
                rotationX: Faces.get(g.CubeNumber)![0] * Math.PI,
                rotationY: Faces.get(g.CubeNumber)![1] * Math.PI,
                rotationZ: Faces.get(g.CubeNumber)![2] * Math.PI,
                scale: 1,
            }],
        })

    }, [api, g.CubeNumber])

    const roll = () => {
        if (g.nowUser === null) return;
        if (g.players[g.nowUser].socketID !== socket.id) return;

        // tell server to roll dice
        socket.emit("roll");
    }
    return (
        <a.mesh
            position={[5, 1, 5]}
            rotation-x={style.rotationX}
            rotation-y={style.rotationY}
            rotation-z={style.rotationZ}
            scale-x={style.scale}
            scale-z={style.scale}
            scale-y={style.scale}
            onClick={() => roll()}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial attach={`material-0`} map={texture_1} />
            <meshBasicMaterial attach={`material-3`} map={texture_2} />
            <meshBasicMaterial attach={`material-4`} map={texture_3} />
            <meshBasicMaterial attach={`material-5`} map={texture_4} />
            <meshBasicMaterial attach={`material-2`} map={texture_5} />
            <meshBasicMaterial attach={`material-1`} map={texture_6} />
        </a.mesh>
    );
};

const socket = io("http://localhost:8080");

function App() {
    const [connected, setConnected] = useState(0);  // 1 connected, 2 connect timedout
    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setConnected(2);
            socket.disconnect();
        }, 10000);

        socket.on('connect', () => {
            console.log("connected", socket.id);
            clearTimeout(timer);
            setConnected(1);
        });

        socket.on('disconnect', () => {
            console.log('disconnected');
        });

        socket.on('message', (data: any) => {
            console.log(data);
        })

        socket.on('update', (data: Game) => {
            setGame(data);
            console.log({ data });
        })

        return () => {
            socket.disconnect();
            clearTimeout(timer);
        }
    }, []);

    const camera = new THREE.PerspectiveCamera();
    camera.position.x = 15;
    camera.position.y = 10;
    camera.zoom = 1;

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            {game !== null ? (
                <>
                    <Canvas camera={camera}>
                        <ambientLight />
                        <pointLight position={[10, 10, 10]} />

                        <Maps temp={new THREE.Object3D()} allMasu={game!.masus} />
                        <Komas
                            temp={new THREE.Object3D()}
                            allKoma={game!.koma}
                            allMasu={game!.masus}
                        />

                        {/* a dash board for debug, maybe reuse */}
                        <Html>
                            <div>

                                <h1>Dashboard</h1>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1px",
                                }}>
                                    <span>player size: {game!.players.length}</span>
                                    <span>Name: {game!.players[0].name}</span>
                                    <span>Next Roll: {game!.CubeNumber}</span>
                                    <button onClick={() => socket.emit("start")}>Start Game</button>

                                </div>

                            </div>
                        </Html>

                        <Suspense fallback={null}>
                            <Cube g={game!} />
                        </Suspense>

                        <OrbitControls makeDefault={true} target={[5, 0, 5]} />
                        <axesHelper />
                    </Canvas>

                </>
            ) : (
                <>
                    <h1>loading</h1>
                    <p>Status: {connected}</p>
                </>
            )}
        </div>
    );
}

export default App;

