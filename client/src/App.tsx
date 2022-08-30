import React, { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const socket = io("http://localhost:3000");

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
    // For Debug
    public id: number;

    public Position: THREE.Vector3;
    public GoalPlayer: number;

    // 0: normal, 1: goal, 2: turn 3: spawn
    public _type: number = 0;

    // 連結管理
    public _prev?: Masu;
    public _next?: Masu;
    public _nextForGoal?: Masu;
    constructor(id: number, position: THREE.Vector3, goalPlayer: number) {
        this.id = id;
        this.Position = position;
        this.GoalPlayer = goalPlayer;
    }
}

class Player {
    public _beginMasu?: Masu;
    public _endMasu?: Masu;
    public _spawnMasu?: Masu;
    constructor(beginMasu?: Masu, endMasu?: Masu, spawnMasu?: Masu) {
        this._beginMasu = beginMasu;
        this._endMasu = endMasu;
        this._spawnMasu = spawnMasu;
    }
}

class Koma {
    public _beginMasu?: Masu;
    public _endMasu?: Masu;
    public _spawnMasu: Masu;
    public _owner: number;
    public Position: THREE.Vector3;
    constructor(
        spawnMasu: Masu,
        owner: number,
        beginMasu?: Masu,
        endMasu?: Masu
    ) {
        this._beginMasu = beginMasu;
        this._endMasu = endMasu;
        this._spawnMasu = spawnMasu;
        this._owner = owner;

        this.Position = new THREE.Vector3(
            this._spawnMasu.Position.x,
            this._spawnMasu.Position.y + 0.2,
            this._spawnMasu.Position.z
        );
    }

    // y座標は固定
    public MoveTo(position: THREE.Vector3) {
        this.Position.x = position.x;
        this.Position.z = position.z;
    }

    public MoveToMasu(masu: Masu) {
        this.Position.x = masu.Position.x;
        this.Position.z = masu.Position.z;
    }

    public MoveToSpawnMasu() {
        this.Position.x = this._spawnMasu.Position.x;
        this.Position.z = this._spawnMasu.Position.z;
    }
}

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
    allKoma: Koma[];
};
function Komas({ temp, allKoma }: KomaProps) {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const shaderRef = useRef<THREE.MeshPhongMaterial>(null!);
    useEffect(() => {
        console.log("Koma Update");
        // Set positions
        for (let i = 0; i < allKoma.length; i++) {
            temp.position.set(
                allKoma[i].Position.x,
                allKoma[i].Position.y,
                allKoma[i].Position.z
            );
            temp.updateMatrix();

            ref.current.setMatrixAt(i, temp.matrix);

            switch (allKoma[i]._owner) {
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

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, allKoma.length]}>
            <boxGeometry args={[0.4, 0.1, 0.4]} />
            <meshPhongMaterial ref={shaderRef} />
        </instancedMesh>
    );
}

// const socket = io("127.0.0.1:8080");

function App() {
    const [allMasu, setAllMasu] = useState<Masu[]>([]);
    const [allKoma, setAllKoma] = useState<Koma[]>([]);
    useMemo(() => {
        let _allMasu: Masu[] = [];
        let _allKoma: Koma[] = [];
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
            const player = new Player();

            const masuBeginIndex = _allMasu.length;

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
                const masu = new Masu(masuBeginIndex + j, rawPostion[j], 1);

                // Masu type
                if (j === 0) {
                    masu._type = 2;
                } else if (j <= 4) {
                    masu._type = 1;
                } else if (j <= 13) {
                    masu._type = 0;
                } else if (j <= 17) {
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

                _allMasu.push(masu);
            }

            //連結管理
            _allMasu[masuBeginIndex + 0]._next = _allMasu[masuBeginIndex + 5];
            _allMasu[masuBeginIndex + 1]._next = _allMasu[masuBeginIndex + 2];
            _allMasu[masuBeginIndex + 2]._next = _allMasu[masuBeginIndex + 3];
            _allMasu[masuBeginIndex + 3]._next = _allMasu[masuBeginIndex + 4];
            // 5~12
            for (let i = 0; i < 9; i++) {
                _allMasu[masuBeginIndex + i + 5]._next =
                    _allMasu[masuBeginIndex + i + 6];
            }
            // 14~17
            for (let i = 0; i < 4; i++) {
                _allMasu[masuBeginIndex + i + 14]._next =
                    _allMasu[masuBeginIndex + 13];
            }

            //_nextForGoal
            _allMasu[masuBeginIndex + 0]._nextForGoal =
                _allMasu[masuBeginIndex + 1];

            // Komas
            for (let k = 0; k < 4; k++) {
                _allKoma.push(new Koma(_allMasu[masuBeginIndex + 14 + k], i));
            }

            // start, end, spawn Masu for player
            player._beginMasu = _allMasu[masuBeginIndex];
            player._endMasu = _allMasu[masuBeginIndex + masuCount - 1];
            player._spawnMasu = _allMasu[masuBeginIndex + 5];
        }
        for (let i = 1; i <= 4; i++) {
            _allMasu[i * 18 - 4 - 1]._next = _allMasu[i * 18];
        }
        _allMasu[67]._next = _allMasu[0];

        // for (let i = 0; i < 18; i++) {
        //     _allMasu[i]._type = 0;
        // }

        setAllKoma(_allKoma);
        setAllMasu(_allMasu);
    }, []);

    const camera = new THREE.PerspectiveCamera();
    camera.position.x = 15;
    // camera.position.z = 6;
    camera.position.y = 10;
    camera.zoom = 1;

    console.log(allMasu);
    console.log(allKoma);
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <Canvas camera={camera}>
                <ambientLight />
                <pointLight position={[10, 10, 10]} />

                <Maps temp={new THREE.Object3D()} allMasu={allMasu} />
                <Komas temp={new THREE.Object3D()} allKoma={allKoma} />

                <OrbitControls makeDefault={true} target={[5, 0, 5]} />
            </Canvas>
        </div>
    );
}

export default App;
