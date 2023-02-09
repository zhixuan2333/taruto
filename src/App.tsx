import { Game } from 'lib/socket'
import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import './App.css'

import { GameScene } from './components/canvas'
import { Join } from './components/join'
import { LoadPage } from './components/loadpage'
import { User } from './components/user'
import { Who } from './components/who'
import { Win } from './components/win'

let url = 'http://localhost:3000'
if (process.env.URL !== undefined && process.env.URL !== '') {
  url = process.env.URL
}
const socket = io(url)

function App(): JSX.Element {
  const [connected, setConnected] = useState(0) // 1 connected, 2 connect timedout
  const [game, setGame] = useState<Game | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setConnected(2)
      socket.disconnect()
    }, 10000)

    socket.on('connect', () => {
      console.log('connected', socket.id)
      clearTimeout(timer)
      setConnected(1)
    })

    socket.on('disconnect', () => {
      console.log('disconnected')
    })

    socket.on('message', (data: any) => {
      console.log(data)
    })

    socket.on('update', (data: Game) => {
      setGame(data)
      console.log({ data })
    })

    return () => {
      socket.disconnect()
      clearTimeout(timer)
      socket.connect()
    }
  }, [])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0b0b0d',
      }}
    >
      {game !== null ? (
        <>
          <GameScene g={game} socket={socket} />
          {game.id === 'lobby' ? <Join g={game} socket={socket} /> : null}
          {game.id !== 'lobby' ? <User g={game} socket={socket} /> : null}
          {game.id !== 'lobby' ? <Who g={game} socket={socket} /> : null}
          {game.id !== 'lobby' && game.nowState === 0 ? (
            <LoadPage status={0} text='Wait for other player' />
          ) : null}
          {game.nowState === 200 ? <Win g={game} socket={socket} /> : null}
        </>
      ) : (
        <>
          <LoadPage status={connected} />
        </>
      )}
    </div>
  )
}

export default App
