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
    allowedHeaders:
            'Content-Type, Authorization, X-Requested-With, X-Socket-ID',
    credentials: true
  }
})

console.log('Server started on port 8080')

const Games = new Map<string, Game>()

io.on('connection', (socket) => {
  console.log('a user connected')

  // for Debug
  socket.rooms.forEach((room) => {
    console.log(room)
  })

  void socket.join('000-000-000')
  // if user more than 4, disconnect
  if (socket.rooms.size > 3) {
    return
  }

  // find game index
  const GameIndex = '000-000-000'

  // if game not found, create game
  if (!Games.has(GameIndex)) {
    Games.set(GameIndex, c.gameCreate(GameIndex))
  }

  let g = Games.get(GameIndex)
  if (g === undefined) { return }

  // if game players more than 4, disconnect
  if (g.players.length > 3) {
    return
  }

  const sync = (g: Game): void => {
    Games.set(GameIndex, g)
    io.to(GameIndex).emit('update', Games.get(GameIndex))
  }

  // if game players less than 4, join game
  g = c.playerJoin(g, socket.id, 'test')
  // send game data
  sync(g)

  // sync game data every event
  socket.onAny(() => {
    io.to(GameIndex).emit('update', Games.get(GameIndex))
  })

  socket.on('start', () => {
    let g = Games.get(GameIndex)
    if (g === undefined) { return }
    console.log('start')
    // TODO: check if state is not 0, return

    g = c.start(g)
    sync(g)
  })

  socket.on('roll', () => {
    let g = Games.get(GameIndex)
    if (g === undefined) { return }

    g = c.roll(g)
    // now Player Komas
    const nowPlayerKomas = g.koma.filter((k) => {
      if (g === undefined) { return false }
      return k.owner === g.nowUser
    })
    // filter if koma is not in goal
    const nowPlayerKomasInGoal = nowPlayerKomas.filter((k) => {
      return !k.isGoal
    })
    // if roll is 6, return
    if (g.CubeNumber === 6) {
      g = c.setAbleSelectKoma(g, nowPlayerKomasInGoal.map((k) => k.id))
      g = c.setNowSelectKoma(g, g.ableSelectKoma[0])
      sync(g)
      return
    }
    // filter koma not in spawnmasu
    const nowPlayerKomasInSpawnmasu = nowPlayerKomasInGoal.filter((k) => {
      return (k.Position !== k._spawnMasu)
    })
    g = c.setAbleSelectKoma(g, nowPlayerKomasInSpawnmasu.map((k) => k.id))
    g = c.setNowSelectKoma(g, g.ableSelectKoma[0])

    // State 100 -> 101
    // Games.set(GameIndex, c.ChangeState(Games.get(GameIndex)!, 101));

    sync(g)
  })

  socket.on('select', (data: number) => {
    // TODO: WIP
    let g = Games.get(GameIndex)
    if (g === undefined) { return }

    if (g.nowSelectKoma === null) { return }
    // if not able select koma, return
    // 0: comfirm
    // 1: next koma
    // 2: prev koma

    switch (data) {
      case 0:
        // Koma went to next step
        g = c.komaMove(g, g.nowSelectKoma, g.CubeNumber)
        break

      case 1:
        // next koma
        g = c.setNowSelectKoma(g, g.ableSelectKoma[0])
        break
      case -1:
        // prev koma
    }
  })

  socket.on('disconnect', () => {
    let g = Games.get(GameIndex)
    if (g === undefined) { return }

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
