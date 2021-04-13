import React from 'react'

import { Viewport, useNavigationContext } from '@databyss-org/ui'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'

import Public from '@databyss-org/notes/app/Public'

import Private from '../modules/Private'

// component
const App = () => {
  const { location } = useNavigationContext()
  const urlParams = new URLSearchParams(location.search)

  const isSignUp = () => location.pathname === '/signup'

  // render methods
  const render = () => (
    <NotifyProvider>
      <ServiceProvider>
        <SessionProvider
          signUp={isSignUp()}
          code={urlParams.get('code')}
          unauthorizedChildren={
            <Viewport p={0}>
              <Public signupFlow={isSignUp()} />
            </Viewport>
          }
        >
          <Private />
        </SessionProvider>
      </ServiceProvider>
    </NotifyProvider>
  )

  return render()
}

export default App
