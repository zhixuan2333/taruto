import { Grid, Loading } from '@nextui-org/react'

export interface Props {
  status: number
}

export function LoadPage ({ status }: Props): JSX.Element {
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
          {status === 0 ? <Loading loadingCss={{ $$loadingSize: '100px', $$loadingBorder: '10px' }} /> : null}
          {status === 2 ? <Loading color="error" loadingCss={{ $$loadingSize: '100px', $$loadingBorder: '10px' }} /> : null}
        </Grid>
      </Grid.Container>
    </div>
    </>
  )
}
