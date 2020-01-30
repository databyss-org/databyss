import React from 'react'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { ThemeProvider } from '@databyss-org/ui/theming'
import { Viewport } from '@databyss-org/ui'
import Public from './Public'
import Page from './Page'

const App = () => {
  const { path } = useNavigationContext()
  const urlParams = new URLSearchParams(window.location.search)

  return (
    <ThemeProvider>
      <NotifyProvider>
        <ServiceProvider>
          <Viewport>
            <SessionProvider
              signUp={path === '/signup'}
              code={urlParams.get('code')}
              unauthorizedChildren={<Public />}
            >
              {/* <Page /> */}
            </SessionProvider>
          </Viewport>
        </ServiceProvider>
      </NotifyProvider>
    </ThemeProvider>
  )
}

export default App
