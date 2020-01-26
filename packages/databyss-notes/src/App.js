import React from 'react'
import SessionProvider, {
  useSessionContext,
} from '@databyss-org/services/session/SessionProvider'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import * as actions from '@databyss-org/services/session/mocks/actions'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { ThemeProvider } from '@databyss-org/ui/theming'
import { View } from '@databyss-org/ui/primitives'

const App = () => {
  const { path } = useNavigationContext()
  return (
    <ThemeProvider>
      <NotifyProvider>
        <ServiceProvider actions={{ session: actions }}>
          <View
            paddingVariant="medium"
            backgroundColor="pageBackground"
            minHeight="100vh"
            alignItems="center"
            justifyContent="center"
          >
            <SessionProvider signUp={path === '/signup'}>
              Databyss Notes
            </SessionProvider>
          </View>
        </ServiceProvider>
      </NotifyProvider>
    </ThemeProvider>
  )
}

export default App
