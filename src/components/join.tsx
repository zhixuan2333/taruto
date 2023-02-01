import { Grid, Input } from '@nextui-org/react'
import { IconSend } from '@tabler/icons-react'
import { useState } from 'react'
import type { Props } from './canvas'

export function Join ({ g, socket }: Props): JSX.Element {
  const [code, setCode] = useState<string>('')

  const join = (): void => {
    // setLoading(true)
    console.log('join', code)
    socket.emit('join', code)
  }

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
            contentClickable
            color="primary"
            labelPlaceholder="Type Your Game Code"
            onChange={(e) => { setCode(e.target.value) } }
            onContentClick={() => { join() }}
            contentRight={ <IconSend/> }
          />
        </Grid>
      </Grid.Container>
    </div>
    </>

  )
}
