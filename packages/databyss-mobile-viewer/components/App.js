import React from 'react'

import { Viewport, useNavigationContext } from '@databyss-org/ui'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import SessionProvider from '@databyss-org/services/session/SessionProvider'

import Public from '../../databyss-notes/src/Public'

import Private from '../modules/Private'

// component
const App = () => {
  const { location } = useNavigationContext()
  const urlParams = new URLSearchParams(location.search)

  const isSignUp = () => location.pathname === '/signup'

  // render methods
  const render = () => (
    <ServiceProvider>
      <Viewport p={0}>
        <SessionProvider
          signUp={isSignUp()}
          code={urlParams.get('code')}
          unauthorizedChildren={<Public />}
        >
          <Private />
        </SessionProvider>
      </Viewport>
    </ServiceProvider>
  )

  return render()
}

export default App
