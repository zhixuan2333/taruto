import type { Props } from './canvas'

export function Win({ g }: Props): JSX.Element {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: '100px',
          }}
        >
          🏆
        </div>
        <div
          style={{
            fontSize: '2rem',
          }}
        >
          Player {g.nowUser !== null ? g.players[g.nowUser].name : null} You are Win!
        </div>
      </div>
    </>
  )
}
