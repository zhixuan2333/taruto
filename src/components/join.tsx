import { Grid, Input } from '@nextui-org/react'
import { IconSearch } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import type { Props } from './canvas'

export function Join ({ g, socket }: Props): JSX.Element {
  const [code, setCode] = useState<string>('')
  // const [loading, setLoading] = useState<boolean>(false)

  const join = (): void => {
    // setLoading(true)
    console.log('join', code)
    socket.emit('join', code)
  }

  useEffect(() => {
    if (g.id !== '') {
      setCode(g.id)
      // setLoading(false)
    }
  }, [g.id])

  return (
    <>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255,255,255,0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Grid.Container gap={4} justify="center">
        <Grid>
          <Input
            size='xl'
            clearable
            bordered
            color="primary"
            labelPlaceholder="Type Your Game Code"
            onChange={(e) => { setCode(e.target.value) } }
            contentRight={
              <IconSearch onClick={join} />
            }
          />
        </Grid>
      </Grid.Container>
    </div>
    </>

  )
}
