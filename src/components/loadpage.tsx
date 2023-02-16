import { Grid, Loading, Text } from '@nextui-org/react'

export interface Props {
  status: number
  text?: string
}

export function LoadPage({ status, text }: Props): JSX.Element {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <Text h1 size={60} css={{ textGradient: '45deg, $purple600 -20%, $pink600 100%' }}>
          {text}
        </Text>
        <Grid>
          {status === 0 ? (
            <Loading loadingCss={{ $$loadingSize: '100px', $$loadingBorder: '10px' }} />
          ) : null}
          {status === 2 ? (
            <Loading
              color='error'
              loadingCss={{ $$loadingSize: '100px', $$loadingBorder: '10px' }}
            />
          ) : null}
        </Grid>
      </div>
    </>
  )
}
