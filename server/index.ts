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

    g = c.roll(g)
    // now Player Komas
    const nowPlayerKomas = g.koma.filter((k) => {
      if (g === undefined) {
        return false
      }
      return k.owner === g.nowUser
    })
    // filter if koma is not in goal
    const nowPlayerKomasInGoal = nowPlayerKomas.filter((k) => {
      return !k.isGoal
    })
    // if roll is 6, return
    if (g.CubeNumber === 6) {
      g = c.setAbleSelectKoma(
        g,
        nowPlayerKomasInGoal.map((k) => k.id),
      )
      sync(g)
      return
    }
    // filter koma not in spawnmasu
    const nowPlayerKomasInSpawnmasu = nowPlayerKomasInGoal.filter((k) => {
      return k.Position !== k._spawnMasu
    })
    g = c.setAbleSelectKoma(
      g,
      nowPlayerKomasInSpawnmasu.map((k) => k.id),
    )

    // State 100 -> 101
    // Games.set(GameIndex, c.ChangeState(Games.get(GameIndex)!, 101));

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

    // if not able select koma, return
    if (!g.ableSelectKoma.includes(data)) {
      return
    }
    g = c.komaMove(g, data, g.CubeNumber)
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
