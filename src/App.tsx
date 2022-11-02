import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Masu, Game, Koma } from "../lib/socket";

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