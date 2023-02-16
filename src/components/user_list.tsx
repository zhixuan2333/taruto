import { User } from '@nextui-org/react'
import type { Props } from './canvas'

export function UserList({ g, socket }: Props): JSX.Element {
  const nowPlayyer = (index: number): boolean => {
    if (g.nowUser === null) return false
    if (g.nowUser === index) return true
    return false
  }
  const getName = (index: number): string => {
    // if use is me
    if (g.players[index].socketID === socket.id) return g.players[index].name + '(あなた)'
    return g.players[index].name
  }
  const getColor = (index: number): string => {
    switch (index) {
      case 0: {
        return 'y.png'
      }
      case 1: {
        return 'b.png'
      }
      case 2: {
        return 'g.png'
      }
      case 3: {
        return 'r.png'
      }
    }
    return 'y.png'
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
          flexDirection: 'column',
          justifyContent: 'left',
          gap: '10px',
        }}
      >
        {g.players.map((player, index) => (
          <>
            <div key={index.toString()}>
              <User
                name={getName(index)}
                size='md'
                bordered
                color={nowPlayyer(index) ? 'primary' : undefined}
                src={'/avatar/' + getColor(index)}
              />
            </div>
          </>
        ))}
      </div>
    </>
  )
}
