import React from 'react'
import { Base64 } from 'js-base64'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { Viewport, useNavigationContext } from '@databyss-org/ui'
import FirefoxWarning from '@databyss-org/ui/components/Notify/FirefoxWarning'
import Public from './Public'
import Private from './Private'

const App = () => {
  const { location } = useNavigationContext()
  const urlParams = new URLSearchParams(location.search)
  let email
  let code
  try {
    ;[email, code] = JSON.parse(Base64.decode(urlParams.get('auth')))
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return (
    <Viewport p={0}>
      <NotifyProvider>
        <ServiceProvider>
          <FirefoxWarning />
          <SessionProvider
            signUp={location.pathname === '/signup'}
            unauthorizedChildren={<Public />}
            email={email}
            code={code}
          >
            <Private />
          </SessionProvider>
        </ServiceProvider>
      </NotifyProvider>
    </Viewport>
  )
}

export default App
