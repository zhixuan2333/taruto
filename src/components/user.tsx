import { Avatar } from '@nextui-org/react'
import type { Props } from './canvas'

export function User({ g, socket }: Props): JSX.Element {
  const nowPlayyer = (index: number): boolean => {
    if (g.nowUser === null) return false
    if (g.nowUser === index) return true
    return false
  }
  const getName = (index: number): string => {
    // if use is me
    if (g.players[index].socketID === socket.id) return 'あなた'
    return g.players[index].name
  }
  const getColor = (index: number): string => {
    switch (index) {
      case 0: {
        return '#e1c302'
      }
      case 1: {
        return '#628ea6'
      }
      case 2: {
        return '#4f8e45'
      }
      case 3: {
        return '#d4474a'
      }
    }
    return 'black'
  }
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          margin: '10px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {g.players.map((player, index) => {
          return (
            <>
              <div key={index}>
                <Avatar
                  text={getName(index)}
                  size='md'
                  color={nowPlayyer(index) ? 'primary' : undefined}
                  squared
                />
                <div
                  style={{
                    // make a dot for now user
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: getColor(index),
                    position: 'relative',
                    bottom: '10px',
                    left: '0',
                    // TODO: fix z-index
                    zIndex: 5,
                  }}
                />
              </div>
            </>
          )
        })}
      </div>
    </>
  )
}
