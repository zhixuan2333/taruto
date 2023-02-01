import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

import { TextureLoader } from 'three/src/loaders/TextureLoader.js'
import { a, useSpring } from '@react-spring/three'
import type { Game, Masu } from '../../lib/socket'
import { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

interface MapProps {
  temp: THREE.Object3D
  allMasu: Masu[]
}

function Maps ({ temp, allMasu }: MapProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ref = useRef<THREE.InstancedMesh>(null!)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const shaderRef = useRef<THREE.MeshPhongMaterial>(null!)

  useEffect(() => {
    // Set positions
    for (let i = 0; i < allMasu.length; i++) {
      temp.position.set(
        allMasu[i].Position.x,

        allMasu[i].Position.y,
        allMasu[i].Position.z
      )
      temp.updateMatrix()

      ref.current.setMatrixAt(i, temp.matrix)

      switch (allMasu[i]._type) {
        case 0: {
          ref.current.setColorAt(i, new THREE.Color(0x00ff00))
          break
        }
        case 1: {
          ref.current.setColorAt(i, new THREE.Color(0xff0000))
          break
        }
        case 2: {
          ref.current.setColorAt(i, new THREE.Color(0x0000ff))
          break
        }
        case 3: {
          ref.current.setColorAt(i, new THREE.Color(0xffff00))
          break
        }
      }
    }
    // Update the instance
    if (ref.current !== undefined) { ref.current.instanceMatrix.needsUpdate = true }
  }, [allMasu, temp])
  return (
      <instancedMesh ref={ref} args={[undefined, undefined, allMasu.length]}>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshPhongMaterial ref={shaderRef} />
      </instancedMesh>
  )
}

function Komas ({ g }: Props): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ref = useRef<THREE.InstancedMesh>(null!)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const shaderRef = useRef<THREE.MeshPhongMaterial>(null!)
  const temp = new THREE.Object3D()
  useEffect(() => {
    // Set positions
    for (let i = 0; i < g.koma.length; i++) {
      temp.position.set(
        g.masus[g.koma[i].Position].Position.x,
        0.2,
        g.masus[g.koma[i].Position].Position.z
      )
      temp.updateMatrix()

      ref.current.setMatrixAt(i, temp.matrix)

      switch (g.koma[i].owner) {
        case 0: {
          ref.current.setColorAt(i, new THREE.Color(0x00ff00))
          break
        }
        case 1: {
          ref.current.setColorAt(i, new THREE.Color(0xff0000))
          break
        }
        case 2: {
          ref.current.setColorAt(i, new THREE.Color(0x0000ff))
          break
        }
        case 3: {
          ref.current.setColorAt(i, new THREE.Color(0xffff00))
          break
        }
      }
      if (i === g.nowSelectKoma) {
        ref.current.setColorAt(i, new THREE.Color(0xffffff))
      }
    }

    // Update the instance
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor != null) { ref.current.instanceColor.needsUpdate = true }
  }, [g, temp])

  return (
      <instancedMesh ref={ref} args={[undefined, undefined, g.koma.length]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshPhongMaterial ref={shaderRef} />
      </instancedMesh>
  )
}

export interface Props {
  g: Game
  socket: Socket<DefaultEventsMap, DefaultEventsMap>
}

function Cube ({ g, socket }: Props): JSX.Element {
  // loading textures
  const [diceOne, diceTwo, diceThere, diceFour, diceFive, diceSix] =
      useLoader(TextureLoader, [
        '/textures/dice_1.jpeg',
        '/textures/dice_2.jpeg',
        '/textures/dice_3.jpeg',
        '/textures/dice_4.jpeg',
        '/textures/dice_5.jpeg',
        '/textures/dice_6.jpeg'
      ])
  const random = (): number => {
    return Math.random() * 4 * Math.PI
  }

  const [style, api] = useSpring(() => ({
    rotationX: 1 * Math.PI,
    rotationY: 0 * Math.PI,
    rotationZ: 0.5 * Math.PI,
    scale: 1
  }))

  useEffect(() => {
    const Faces: number[][] = [
      [0, 0, 0.5],
      [0, 0, 1],
      [0.5, 1, 0],
      [0.5, 0, 0],
      [0, 0, 0],
      [1, 0, 0.5]
    ]

    api.start({
      to: [
        {
          rotationX: random(),
          rotationY: random(),
          rotationZ: random(),
          scale: 1.5
        },
        {
          rotationX: Faces[g.CubeNumber - 1][0] * Math.PI,
          rotationY: Faces[g.CubeNumber - 1][1] * Math.PI,
          rotationZ: Faces[g.CubeNumber - 1][2] * Math.PI,
          scale: 1
        }
      ]
    })
  }, [api, g.CubeNumber])

  const roll = (): void => {
    if (g.nowUser === null) return
    if (g.players[g.nowUser].socketID !== socket.id) return

    // tell server to roll dice
    socket.emit('roll')
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
        onClick={() => { roll() }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial attach={'material-0'} map={diceOne} />
        <meshBasicMaterial attach={'material-3'} map={diceTwo} />
        <meshBasicMaterial attach={'material-4'} map={diceThere} />
        <meshBasicMaterial attach={'material-5'} map={diceFour} />
        <meshBasicMaterial attach={'material-2'} map={diceFive} />
        <meshBasicMaterial attach={'material-1'} map={diceSix} />
      </a.mesh>
  )
}

export function GameScene ({ g, socket }: Props): JSX.Element {
  const camera = new THREE.PerspectiveCamera()
  camera.position.x = 15
  camera.position.y = 10
  camera.zoom = 1
  return (<Canvas camera={camera}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Maps
          temp={new THREE.Object3D()}
          allMasu={g.masus}
        />
        <Komas g={g} socket={socket} />

        {/* a dash board for debug, maybe reuse */}
        <Html>
          <div>
            <h1>Dashboard</h1>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1px'
              }}
            >
              <span>
                player size: {g.players.length}
              </span>
              <span>Name: {g.players[0].name}</span>
              <span>Next Roll: {g.CubeNumber}</span>
              <span>
                Next select Koma: {g.nowSelectKoma}
              </span>
              <button
                onClick={() => socket.emit('start')}
              >
                Start Game
              </button>
              <div>
                {/* 3 buttom: select now koma, next Koma, Prev Koma */}
                <button
                  onClick={() => {
                    socket.emit('select', 0)
                  }}
                >
                  Select
                </button>
                <button
                  onClick={() => {
                    socket.emit('select', 1)
                  }}
                >
                  Next
                </button>
                <button
                  onClick={() => {
                    socket.emit('select', -1)
                  }}
                >
                  Prev
                </button>
              </div>
            </div>
          </div>
        </Html>

        <Suspense fallback={null}>
          <Cube g={g} socket={socket} />
        </Suspense>

        <OrbitControls makeDefault={true} target={[5, 0, 5]} />
        <axesHelper />
      </Canvas>
  )
}
