interface Masu {
  id: number

  Position: THREE.Vector3
  GoalPlayer: number

  // 0: normal, 1: goal, 2: turn 3: spawn
  _type: number

  // 連結管理
  _prev: number | null
  _next: number | null
  _nextForGoal: number | null
}

interface Player {
  // 0~3
  id: number
  socketID: string
  name: string
  // _beginMasu: Masu | null;
  // _endMasu: Masu | null;
  // _spawnMasu: Masu | null;
}

interface Koma {
  // 0~3
  owner: number
  // 0~15
  id: number
  _beginMasu: number | null
  _endMasu: number | null
  _spawnMasu: number
  Position: number
  isGoal: boolean
}

interface Game {
  id: string
  name: string
  players: Player[]
  masus: Masu[]
  koma: Koma[]
  nowUser: number | null

  // nowState
  // -1: game end
  // 0: game not start
  // 100: Cube roll
  // 101: Koma move
  // 102: Koma move and Cube roll
  // 200: game end
  nowState: number

  CubeNumber: number
  ableSelectKoma: number[]
}

export type { Masu, Player, Koma, Game }
