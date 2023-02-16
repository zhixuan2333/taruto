import { Input, Text, createTheme, NextUIProvider } from '@nextui-org/react'
import { IconSend } from '@tabler/icons-react'
import { useState } from 'react'
import type { Props } from './canvas'

const darkTheme = createTheme({
  type: 'dark',
})

export function Join({ socket }: Props): JSX.Element {
  const [code, setCode] = useState<string>('')

  const join = (): void => {
    console.log('join', code)
    socket.emit('join', code)
  }

  return (
    <>
      <NextUIProvider theme={darkTheme}>
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
          <div>
            <Text
              h1
              size={60}
              css={{
                textGradient: '45deg, $purple600 -20%, $pink600 100%',
              }}
              weight='bold'
            >
              Play
            </Text>
            <Text
              h1
              size={60}
              css={{
                textGradient: '45deg, $yellow600 -20%, $red600 100%',
              }}
              weight='bold'
            >
              Taruto
            </Text>
            <Input
              size='xl'
              clearable
              contentClickable
              color='primary'
              placeholder='コードを入力してね'
              onChange={(e) => {
                setCode(e.target.value)
              }}
              onContentClick={() => {
                join()
              }}
              contentRight={<IconSend />}
            />
          </div>
        </div>
      </NextUIProvider>
    </>
  )
}
