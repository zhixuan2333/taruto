// functions for Game, Player, Masu, Koma

import * as THREE from 'three'
import { Game, Koma, Masu } from '../lib/socket'

// Game
export function gameCreate (RoomID: string): Game {
  const game: Game = {
    id: RoomID,
    name: 'test',
    players: [],
    masus: Masus,
    koma: Komas,
    nowUser: null,
    CubeNumber: 1,
    nowSelectKoma: null,
    nowState: 0,
    ableSelectKoma: []
  }
  return game
}

export function start (g: Game): Game {
  g.nowUser = 0
  g.nowState = 100
  return g
}

export function ChangeState (g: Game, state: number): Game {
  g.nowState = state
  return g
}

export function setAbleSelectKoma (g: Game, koma: number[]): Game {
  g.ableSelectKoma = koma
  return g
}

export function setNowSelectKoma (g: Game, koma: number | null): Game {
  g.nowSelectKoma = koma
  return g
}

// Cube
function randomCube (): number {
  // random number 1~6
  const random = Math.floor(Math.random() * 6) + 1
  return random
}

export function roll (g: Game): Game {
  g.CubeNumber = randomCube()
  return g
}

// Player
export function playerJoin (g: Game, socketID: string, name: string): Game {
  if (g.players.length >= 4) {
    return g
  }
  g.players.push({
    id: g.players.length,
    socketID,
    // TODO: nameの重複チェック, random name
    name
  })
  return g
}

export function playerLeave (g: Game, socketID: string): Game {
  const player = g.players.find((p) => p.socketID === socketID)
  if (player == null) {
    return g
  }
  if (g.nowUser === player.id) {
    g.nowUser = null
  }
  g.players = g.players.filter((p) => p.socketID !== socketID)
  return g
}

// Masu

// Koma
export function komaMove (g: Game, koma: number, step: number): Game {
  let nextMasu = g.koma[koma].Position
  for (let i = 0; i < step; i++) {
    // if true point is goal
    if (g.masus[nextMasu]._type === 2 &&
      g.masus[nextMasu].GoalPlayer === g.koma[koma].owner &&
      g.masus[nextMasu]._nextForGoal !== null) {
      // set koma position to goal point
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      nextMasu = g.masus[nextMasu]._nextForGoal!
      continue
    }

    // Because there is no next point
    if (g.masus[nextMasu]._next === null) {
      // set koma is in goal point
      g.koma[koma].isGoal = true
      break
    }
    // normal logic
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    nextMasu = g.masus[nextMasu]._next!
  }
  g.koma[koma].Position = nextMasu
  return g
}

export function komaMoveTo (g: Game, koma: number, masu: number): Game {
  g.koma[koma].Position = masu
  return g
}

export function komaDeath (g: Game, koma: number): Game {
  g.koma[koma].Position = g.koma[koma]._spawnMasu
  return g
}
// other

interface setupProps {
  Masus: Masu[]
  Komas: Koma[]
}

function setup (): setupProps {
  const Masus: Masu[] = []
  const Komas: Koma[] = []
  const mapPosition: THREE.Vector3[] = [
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
    new THREE.Vector3(2, 0, 2)
  ]
  const playerCount: number = 4
  const masuCount: number = 18
  const size: number = 10
  for (let i = 0; i < playerCount; i++) {
    const masuBeginIndex = Masus.length

    let rawPostion: THREE.Vector3[] = []

    switch (i) {
      case 1: {
        rawPostion = mapPosition.map((v) => {
          const v2 = v.clone()
          v2.x = v.z
          v2.z = v.x
          v2.z *= -1
          v2.z += size
          return v2
        })
        break
      }

      case 2: {
        rawPostion = mapPosition.map((v) => {
          const v2 = v.clone()
          v2.x *= -1
          v2.z *= -1
          v2.x += size
          v2.z += size
          return v2
        })
        break
      }

      case 3: {
        rawPostion = mapPosition.map((v) => {
          const v2 = v.clone()
          v2.x = v.z
          v2.z = v.x
          v2.x *= -1
          v2.x += size
          return v2
        })
        break
      }

      default:
        rawPostion = mapPosition
        break
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
        _nextForGoal: null
      }

      // Masu type
      if (j === 0) {
        // turn
        masu._type = 2
      } else if (j <= 4) {
        // goal
        masu._type = 1
      } else if (j <= 13) {
        // normal
        masu._type = 0
      } else if (j <= 17) {
        // spawn
        masu._type = 3
      }

      // 普通の Masu は-1
      if (masu._type === 1 || masu._type === 3) {
        masu.GoalPlayer = i - 1
        if (i === 0) {
          masu.GoalPlayer = 3
        }
      } else {
        masu.GoalPlayer = -1
      }

      Masus.push(masu)
    }

    // 連結管理
    for (let i = 0; i < 9; i++) {
      Masus[masuBeginIndex + 13 - i]._next = masuBeginIndex + 12 - i
    }
    Masus[masuBeginIndex + 5]._next = masuBeginIndex
    for (let i = 0; i < 3; i++) {
      Masus[masuBeginIndex + 1 + i]._next = masuBeginIndex + 2 + i
    }
    // 14~17
    for (let i = 0; i < 4; i++) {
      Masus[masuBeginIndex + i + 14]._next = masuBeginIndex + 13
    }

    // _nextForGoal
    Masus[masuBeginIndex + 0]._nextForGoal = masuBeginIndex + 1

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
        Position: masuBeginIndex + 14 + k
      })
    }

    // start, end, spawn Masu for player
    // const player: Player = {
    //     _beginMasu: Masus[masuBeginIndex],
    //     _endMasu: Masus[masuBeginIndex + masuCount - 1],
    //     _spawnMasu: Masus[masuBeginIndex + 5],
    // };
  }
  for (let i = 1; i <= 3; i++) {
    Masus[i * 18]._next = i * 18 - 4 - 1
  }
  Masus[0]._next = 67
  return { Masus, Komas }
}

const { Masus, Komas } = setup()
