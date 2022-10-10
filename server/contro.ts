// functions for Game, Player, Masu, Koma

import { Game } from ".";

type err = string | null;

// Game

// Player
function playerJoin(g: Game, socketID: string, name: string): err {
    if (g.players.length >= 4) {
        return "Game is full";
    }
    g.players.push({
        id: g.players.length,
        socketID: socketID,
        // TODO: nameの重複チェック, random name
        name: name,
    });
    return null;
}

function playerLeave(g: Game, socketID: string): err {
    const player = g.players.find((p) => p.socketID === socketID);
    if (!player) {
        return "Player not found";
    }
    if (g.nowUser === player) {
        g.nowUser = null;
    }
    g.players = g.players.filter((p) => p.socketID !== socketID);
    return null;
}

// Masu

// Koma
function komaMoveTo(g: Game, koma: number, masu: number) {
    g.koma[koma].Position = masu;
}

function komaDeath(g: Game, koma: number) {
    g.koma[koma].Position = g.koma[koma]._spawnMasu;
}
