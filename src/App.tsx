import "./App.css";
import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import {
    Canvas,
    useFrame,
    useThree,
    ReactThreeFiber,
} from "@react-three/fiber";

function Box(props: JSX.IntrinsicElements["mesh"]) {
    const ref = useRef<THREE.Mesh>(null!);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);
    useFrame((state, delta) => (ref.current.rotation.x += 0.01));
    return (
        <mesh
            {...props}
            ref={ref}
            scale={clicked ? 2 : 1}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
        </mesh>
    );
}

function Ball(props: JSX.IntrinsicElements["mesh"]) {
    const ref = useRef<THREE.Mesh>(null!);
    const [hovered, hover] = useState(false);

    useFrame((state, delta) => {
        ref.current.rotation.x += 0.2;
        ref.current.rotation.y += 0.2;
    });
    return (
        <mesh
            {...props}
            ref={ref}
            scale={hovered ? 2 : 1}
            onClick={(event) => console.log("clicked")}
            onPointerOver={(e) => hover(true)}
            onPointerOut={(e) => hover(false)}
        >
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial color="#FF0000" />
        </mesh>
    );
}

function Floor() {
    return (
        <mesh receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshPhongMaterial color="green" />
        </mesh>
    );
}

// const Controls = (props: JSX.IntrinsicElements["orbitControls"]) => {
//     const ref = useRef<OrbitControls>(null);
//     const { invalidate, camera, gl } = useThree();
//     useEffect(() => {
//         if (ref && ref.current) {
//             ref.current.addEventListener("change", invalidate);
//             ref.current.removeEventListener("change", invalidate);
//         }
//     }, []);
//     return (
//         <orbitControls ref={ref} args={[camera, gl.domElement]} {...props} />
//     );
// };

type Blocks = {
    // type: 0: normal, 1: wait, 2: return, 3: goal, 4: spwan
    type: number;
    position: number[];
    color: string;
};

function Instances({ count = 20, temp = new THREE.Object3D() }) {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const blocks: Blocks[] = [
        {
            type: 0,
            position: [2, 1],
            color: "black",
        },
        {
            type: 0,
            position: [3, 1],
            color: "black",
        },
        {
            type: 0,
            position: [4, 1],
            color: "black",
        },
        {
            type: 0,
            position: [5, 1],
            color: "black",
        },

        {
            type: 3,
            position: [1, 1],
            color: "green",
        },
    ];
    useEffect(() => {
        // Set positions
        for (let i = 0; i < blocks.length; i++) {
            temp.position.set(blocks[i].position[0], blocks[i].position[1], 0);
            temp.updateMatrix();

            ref.current.setMatrixAt(i, temp.matrix);
        }
        // Update the instance
        ref.current.instanceMatrix.needsUpdate = true;
    }, []);
    return (
        <instancedMesh ref={ref} args={[undefined, undefined, count]}>
            <boxGeometry args={[0.5, 0.5, 0.2]} />
            <meshPhongMaterial color="#049ef4" />
        </instancedMesh>
    );
}

function App() {
    return (
        <div className="Canvas">
            <Canvas>
                <ambientLight />
                {/* <directionalLight position={[10, 10, 10]} /> */}
                <spotLight
                    color="#fffff"
                    intensity={2}
                    distance={100}
                    angle={Math.PI / 4}
                    penumbra={0.5}
                    castShadow
                />
                {/* <Controls /> */}
                {/* <Rig /> */}

                {/* <Floor /> */}
                {/* <fog attach="fog" color={"#fff"} near={1} far={20} /> */}
                <pointLight position={[10, 10, 10]} />

                <Instances />

                {/* <Ball position={[0, -1.2, 0]} /> */}
            </Canvas>
        </div>
    );
}

export default App;
