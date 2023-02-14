import pino from 'pino'
import { Server } from 'socket.io'
import * as c from './contro'
import type { Game } from '../lib/socket'

// Got port form env
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
const port = Number(process.env.PORT) || 8080

const io = new Server(port, {
  /* options */
  cors: {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, X-Socket-ID',
    credentials: true,
  },
})

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
})

logger.info('Server started on port 8080')

const Games = new Map<string, Game>()
Games.set('lobby', c.gameCreate('lobby'))

io.on('connection', (socket) => {
  logger.info('[USER] connected' + socket.id)

  // for Debug
  socket.rooms.forEach((room) => {
    logger.debug('[ROOM] ' + socket.id + ' had in socket room ' + room)
  })

  // find game index
  let GameIndex: string = ''

  const sync = (g: Game): void => {
    logger.info('[GAME] sync ' + GameIndex)
    if (g.id === 'lobby') {
      return
    }
    Games.set(GameIndex, g)
    io.to(GameIndex).emit('update', Games.get(GameIndex))
  }

  // join lobby
  void socket.join('lobby')
  socket.emit('update', Games.get('lobby'))

  // join room
  socket.on('join', (room: string) => {
    if (room === '') {
      socket.emit('err', 'void')
      return
    }

    // if game not found, create game
    if (!Games.has(room)) {
      Games.set(room, c.gameCreate(room))
    }
    let g = Games.get(room)
    if (g === undefined) {
      return
    }

    // if user more than 4, disconnect
    if (g.players.length > 3) {
      socket.emit('err', 'full')
      return
    }
    void socket.join(room)
    GameIndex = room
    void socket.leave('lobby')

    // if game players less than 4, join game
    g = c.playerJoin(g, socket.id, 'test')
    // if game players lenth is 4, start game
    if (g.players.length === 4) {
      g = c.start(g)
    }
    logger.info('[ROOM] ' + socket.id + ' join to ' + room)

    // send game data
    sync(g)
  })

  // sync game data every event
  socket.onAny(() => {
    io.to(GameIndex).emit('update', Games.get(GameIndex))
  })

  socket.on('roll', () => {
    let g = Games.get(GameIndex)
    if (g === undefined) {
      return
    }
    if (g.nowState !== 100) {
      return
    }
    if (g.nowUser === null) {
      return
    }
    if (g.players[g.nowUser].socketID !== socket.id) {
      return
    }

    g = c.roll(g)
    const selectAbleKoma = c.komaSelectAble(g)
    g = c.setAbleSelectKoma(g, selectAbleKoma)
    if (g.CubeNumber === 6) {
      g = c.ChangeState(g, 102)
    } else {
      g = c.ChangeState(g, 101)
    }

    if (selectAbleKoma.length === 0) {
      g = c.nextPlayer(g)
      g = c.ChangeState(g, 100)
    }
    logger.info('[GAME] roll ' + GameIndex)
    sync(g)
  })

  socket.on('move', (data: number) => {
    if (data === undefined) {
      return
    }
    if (!(data >= 0 && data < 16)) {
      return
    }

    let g = Games.get(GameIndex)
    if (g === undefined) {
      return
    }
    if (!(g.nowState === 101 || g.nowState === 102)) {
      return
    }

    // if not able select koma, return
    if (!g.ableSelectKoma.includes(data)) {
      return
    }
    g = c.komaMove(g, data, g.CubeNumber)
    // Get all koma
    const komasInGoal = g.koma.filter((k) => g?.nowUser === k.owner && k.isGoal)
    // if koma is 4, game end
    if (komasInGoal.length === 4) {
      g = c.ChangeState(g, 200)
      sync(g)
      return
    }

    // Change state
    if (g.nowState === 101) {
      g = c.nextPlayer(g)
    }
    g = c.ChangeState(g, 100)

    logger.info('[GAME] move ' + GameIndex)
    sync(g)
  })

  socket.on('disconnect', () => {
    let g = Games.get(GameIndex)
    if (g === undefined) {
      return
    }

    // remove player
    void socket.leave(GameIndex)
    g = c.playerLeave(g, socket.id)
    sync(g)
    if (g.players.length === 0) {
      Games.delete(GameIndex)
    }

    logger.info('[ROOM] ' + socket.id + ' leave from' + GameIndex)
  })
})

io.on('disconnect', (socket) => {
  socket.leave('room1')
  console.log('user disconnected')
})
