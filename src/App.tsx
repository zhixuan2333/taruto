import React, { Suspense, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { TextureLoader } from 'three/src/loaders/TextureLoader.js'
import { Mesh } from "three";
import { a, useSpring } from "@react-spring/three";

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


const socket = io("http://localhost:8080");

function App() {
    const [game, setGame] = useState<Game | null>(null);

    function Cube() {
        const [spring, api] = useSpring(() => ({
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            scale: 1,
            onRest: () => {
            }
        }));

        // a function to rotation X,Y,Z to a random face of dice
        const onClick = () => {
            const random = (): number => { return Math.random() * 4 * Math.PI }

            socket.emit('Cube')
            api.start({
                rotationX: random(),
                rotationY: random(),
                rotationZ: random(),
                scale: 1.5
            })
            socket.on('Cube', (data: number) => {
                const Face: number[][] = [
                    // 1~6
                    [0, 0, 0],

                ]
                api.start({
                    rotationX: random(),
                    rotationY: random(),
                    rotationZ: random(),
                    scale: 1.5
                })
            })

        }

        const [texture_1, texture_2, texture_3, texture_4, texture_5, texture_6] = useLoader(TextureLoader, [
            '/textures/dice_1.jpeg',
            '/textures/dice_2.jpeg',
            '/textures/dice_3.jpeg',
            '/textures/dice_4.jpeg',
            '/textures/dice_5.jpeg',
            '/textures/dice_6.jpeg',
        ]);
        const boxRef = useRef<Mesh>(null!);

        return (
            <a.mesh
                ref={boxRef}
                rotation-x={spring.rotationX}
                rotation-y={spring.rotationY}
                rotation-z={spring.rotationZ}
                scale-x={spring.scale}
                scale-z={spring.scale}
                scale-y={spring.scale}
                onClick={() => onClick()}
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

    useEffect(() => {
        socket.on('connect', () => {
            console.log('connected');

        });

        socket.on('disconnect', () => {
            console.log('disconnected');
        });

        socket.on('message', (data: any) => {
            console.log(data);
        })

        socket.on('update', (data: Game) => {
            setGame(data);
            console.log(data);
        })


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
                        <Suspense fallback={null}>
                            <Cube />
                        </Suspense>

                        <OrbitControls makeDefault={true} target={[5, 0, 5]} />
                        <axesHelper />
                    </Canvas>

                </>
            ) : (
                <h1>loading</h1>
            )}
        </div>
    );
}

export default App;
