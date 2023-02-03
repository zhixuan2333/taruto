import { Avatar } from '@nextui-org/react'
import type { Props } from './canvas'

export function User({ g }: Props): JSX.Element {
  const nowPlayyer = (index: number): boolean => {
    if (g.nowUser === null) return false
    if (g.nowUser === index) return true
    return false
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
            <Avatar
              key={index}
              text={player.name}
              size='lg'
              color={nowPlayyer(index) ? 'primary' : 'secondary'}
              src='https://i.pravatar.cc/150?u=a042581f4e29026024d'
              bordered
            />
          )
        })}
      </div>
    </>
  )
}
