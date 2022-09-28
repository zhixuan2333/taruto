import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

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
    // setAllKoma: React.Dispatch<React.SetStateAction<Koma[]>>;
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
    }, [allKoma, temp]);


    // // # For Debug
    // let id: number = 0;
    // let masu: Masu = allKoma[id]._spawnMasu
    // let time: number = 0;
    // let temp2 = temp.clone();
    // useFrame(() => {
    //     time++;
    //     if (time % 10 !== 0) return;
    //     setAllKoma(() => {
    //         allKoma[id].Position = masu.Position;
    //         allKoma[id].Position.y = 0.2;

    //         return allKoma;
    //     });
    //     temp2.position.set(
    //         allKoma[id].Position.x,
    //         allKoma[id].Position.y,
    //         allKoma[id].Position.z
    //     );
    //     temp2.updateMatrix();
    //     console.log(allKoma[id].Position);

    //     ref.current.setMatrixAt(id, temp2.matrix);

    //     ref.current.instanceMatrix.needsUpdate = true;

    //     if (
    //         masu._nextForGoal !== null &&
    //         masu._nextForGoal.GoalPlayer === allKoma[id]._owner
    //     ) {
    //         masu = masu._nextForGoal;
    //     } else if (masu._next !== null) {
    //         masu = masu._next;
    //     }
    // });
    return (
        <instancedMesh ref={ref} args={[undefined, undefined, allKoma.length]}>
            <boxGeometry args={[0.4, 0.1, 0.4]} />
            <meshPhongMaterial ref={shaderRef} />
        </instancedMesh>
    );
}


const socket = io("http://localhost:8080");

function App() {
    // const [allMasu, setAllMasu] = useState<Masu[]>([]);
    // const [allKoma, setAllKoma] = useState<Koma[]>([]);
    const [game, setGame] = useState<Game | null>(null);
    // useMemo(() => {
    //     let _allMasu: Masu[] = [];
    //     let _allKoma: Koma[] = [];
    //     let mapPosition: THREE.Vector3[] = [
    //         // 左下を0,0にする
    //         // turn point
    //         new THREE.Vector3(5, 0, 0),
    //         // Goal Masu
    //         new THREE.Vector3(5, 0, 1),
    //         new THREE.Vector3(5, 0, 2),
    //         new THREE.Vector3(5, 0, 3),
    //         new THREE.Vector3(5, 0, 4),
    //         // normal
    //         new THREE.Vector3(4, 0, 0),
    //         new THREE.Vector3(4, 0, 1),
    //         new THREE.Vector3(4, 0, 2),
    //         new THREE.Vector3(4, 0, 3),
    //         new THREE.Vector3(4, 0, 4),
    //         new THREE.Vector3(3, 0, 4),
    //         new THREE.Vector3(2, 0, 4),
    //         new THREE.Vector3(1, 0, 4),
    //         new THREE.Vector3(0, 0, 4),
    //         // spawn
    //         new THREE.Vector3(1, 0, 1),
    //         new THREE.Vector3(2, 0, 1),
    //         new THREE.Vector3(1, 0, 2),
    //         new THREE.Vector3(2, 0, 2),
    //     ];
    //     const playerCount: number = 4;
    //     const masuCount: number = 18;
    //     const size: number = 10;
    //     for (let i = 0; i < playerCount; i++) {

    //         const masuBeginIndex = _allMasu.length;

    //         let rawPostion: THREE.Vector3[] = [];

    //         switch (i) {
    //             default:
    //                 rawPostion = mapPosition;
    //                 break;

    //             case 1: {
    //                 rawPostion = mapPosition.map((v) => {
    //                     const v2 = v.clone();
    //                     v2.x = v.z;
    //                     v2.z = v.x;
    //                     v2.z *= -1;
    //                     v2.z += size;
    //                     return v2;
    //                 });
    //                 break;
    //             }

    //             case 2: {
    //                 rawPostion = mapPosition.map((v) => {
    //                     const v2 = v.clone();
    //                     v2.x *= -1;
    //                     v2.z *= -1;
    //                     v2.x += size;
    //                     v2.z += size;
    //                     return v2;
    //                 });
    //                 break;
    //             }

    //             case 3: {
    //                 rawPostion = mapPosition.map((v) => {
    //                     const v2 = v.clone();
    //                     v2.x = v.z;
    //                     v2.z = v.x;
    //                     v2.x *= -1;
    //                     v2.x += size;
    //                     return v2;
    //                 });
    //                 break;
    //             }
    //         }
    //         for (let j = 0; j < masuCount; j++) {
    //             // const masu: Masu = new Masu(masuBeginIndex + j, rawPostion[j], 1);
    //             const masu: Masu = {
    //                 id: masuBeginIndex + j,
    //                 Position: rawPostion[j],
    //                 GoalPlayer: i,
    //                 _type: 0,
    //                 _prev: null,
    //                 _next: null,
    //                 _nextForGoal: null
    //             }

    //             // Masu type
    //             if (j === 0) {
    //                 // turn
    //                 masu._type = 2;
    //             } else if (j <= 4) {
    //                 // goal
    //                 masu._type = 1;
    //             } else if (j <= 13) {
    //                 // normal
    //                 masu._type = 0;
    //             } else if (j <= 17) {
    //                 // spawn
    //                 masu._type = 3;
    //             }

    //             // 普通の Masu は-1
    //             if (j <= 4 && j >= 1) {
    //                 masu.GoalPlayer = i - 1;
    //                 if (i === 0) {
    //                     masu.GoalPlayer = 3;
    //                 }
    //             } else {
    //                 masu.GoalPlayer = -1;
    //             }

    //             _allMasu.push(masu);
    //         }

    //         // 連結管理
    //         for (let i = 0; i < 9; i++) {
    //             _allMasu[masuBeginIndex + 13 - i]._next =
    //                 _allMasu[masuBeginIndex + 12 - i];
    //         }
    //         _allMasu[masuBeginIndex + 5]._next = _allMasu[masuBeginIndex];
    //         for (let i = 0; i < 3; i++) {
    //             _allMasu[masuBeginIndex + 1 + i]._next =
    //                 _allMasu[masuBeginIndex + 2 + i];
    //         }
    //         // 14~17
    //         for (let i = 0; i < 4; i++) {
    //             _allMasu[masuBeginIndex + i + 14]._next =
    //                 _allMasu[masuBeginIndex + 13];
    //         }

    //         // _nextForGoal
    //         _allMasu[masuBeginIndex + 0]._nextForGoal =
    //             _allMasu[masuBeginIndex + 1];

    //         // Komas
    //         for (let k = 0; k < 4; k++) {
    //             // _allKoma.push(new Koma(_allMasu[masuBeginIndex + 14 + k], i));
    //             _allKoma.push({
    //                 id: i * 4 + k,
    //                 isGoal: false,
    //                 owner: i,
    //                 _spawnMasu: _allMasu[masuBeginIndex + 14 + k],
    //                 _beginMasu: null,
    //                 _endMasu: null,
    //                 Position: new THREE.Vector3(
    //                     _allMasu[masuBeginIndex + 14 + k].Position.x,
    //                     _allMasu[masuBeginIndex + 14 + k].Position.y + 0.2,
    //                     _allMasu[masuBeginIndex + 14 + k].Position.z
    //                 )
    //             });

    //         }

    //         // start, end, spawn Masu for player
    //         // const player: Player = {
    //         //     _beginMasu: _allMasu[masuBeginIndex],
    //         //     _endMasu: _allMasu[masuBeginIndex + masuCount - 1],
    //         //     _spawnMasu: _allMasu[masuBeginIndex + 5],
    //         // };

    //     }
    //     for (let i = 1; i <= 3; i++) {
    //         _allMasu[i * 18]._next = _allMasu[i * 18 - 4 - 1];
    //     }
    //     _allMasu[0]._next = _allMasu[67];

    //     setAllKoma(_allKoma);
    //     setAllMasu(_allMasu);
    // }, []);

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
