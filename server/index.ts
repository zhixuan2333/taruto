import { Server } from 'socket.io'
import * as c from './contro'
import type { Game } from '../lib/socket'

// Got port form env
// TODO: got port from env
const port = 8080

const io = new Server(port, {
  /* options */
  cors: {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, X-Socket-ID',
    credentials: true,
  },
})

console.log('Server started on port 8080')

const Games = new Map<string, Game>()
Games.set('lobby', c.gameCreate('lobby'))

io.on('connection', (socket) => {
  console.log('a user connected')

  // for Debug
  socket.rooms.forEach((room) => {
    console.log(room)
  })

  // find game index
  let GameIndex: string = ''

  const sync = (g: Game): void => {
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
    console.log('join room: ' + room)
    GameIndex = room
    void socket.leave('lobby')

    // if game players less than 4, join game
    g = c.playerJoin(g, socket.id, 'test')
    // if game players lenth is 4, start game
    if (g.players.length === 4) {
      g = c.start(g)
    }

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

    console.log('user disconnected')
  })
})

io.on('disconnect', (socket) => {
  socket.leave('room1')

  // maybe not use
  // delete Games.delete[socket.id];
  // if (
  //     Games["0"].nowUser !== null &&
  //     Games["0"].nowUser.socketID == socket.id
  // ) {
  //     Games["0"].nowUser = null;
  // }
  console.log('user disconnected')
})
