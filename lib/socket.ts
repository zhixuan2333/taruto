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
    nowUser: number | null;

    // nowState
    // -1: game end
    // 0: game not start
    // 100: Cube roll
    // 101: Koma move
    // 102: Koma move and Cube roll
    nowState: number;

    CubeNumber: number;
    // nowSelectKoma if is null is select cube
    // if is number is select koma
    nowSelectKoma: number | null;
};

export type { Masu, Player, Koma, Game };