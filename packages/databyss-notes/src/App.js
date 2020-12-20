import React from 'react'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { Viewport, useNavigationContext } from '@databyss-org/ui'
import ReleaseNotes from '@databyss-org/ui/components/Notify/ReleaseNotes'
import FirefoxWarning from '@databyss-org/ui/components/Notify/FirefoxWarning'
import Public from './Public'
import Private from './Private'

const App = () => {
  const { location } = useNavigationContext()
  const urlParams = new URLSearchParams(location.search)
  return (
    <NotifyProvider>
      <ServiceProvider>
        <Viewport p={0}>
          <FirefoxWarning />
          <SessionProvider
            signUp={location.pathname === '/signup'}
            code={urlParams.get('code')}
            unauthorizedChildren={<Public />}
          >
            <ReleaseNotes />
            <Private />
          </SessionProvider>
        </Viewport>
      </ServiceProvider>
    </NotifyProvider>
  )
}

export default App
