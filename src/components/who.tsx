import type { Props } from './canvas'

export function Who({ g, socket }: Props): JSX.Element {
  const getName = (index: number): string => {
    // if use is me
    if (g.players[index].socketID === socket.id) return 'あなた'
    return g.players[index].name
  }
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 10,
          left: 0,
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            padding: '10px',
            borderRadius: '15px',
            // border
            backgroundColor: 'rgba(255,255,255,0.1)',
          }}
        >
          {g.nowUser !== null ? getName(g.nowUser) + ' が操作中' : null}
        </div>
      </div>
    </>
  )
}
