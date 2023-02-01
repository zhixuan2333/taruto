import { Game } from 'lib/socket'
import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import './App.css'
import { GameScene } from './components/canvas'

import { Join } from './components/join'

const socket = io('http://localhost:8080')

function App (): JSX.Element {
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
    <div style={{ width: '100vw', height: '100vh' }}>
      {game !== null
        ? (
        <>
        <GameScene g={game} socket={socket} />
        <Join g={game} socket={socket} />
        </>
          )
        : (
          <>
            <h1>loading</h1>
            <p>Status: {connected}</p>
          </>
          )}
    </div>
  )
}

export default App
