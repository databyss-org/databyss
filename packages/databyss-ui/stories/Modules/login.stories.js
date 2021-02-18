import React from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text, List, Button } from '@databyss-org/ui/primitives'
import SessionProvider, {
  useSessionContext,
} from '@databyss-org/services/session/SessionProvider'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import * as actions from '@databyss-org/services/session/mocks/actions'
import NavigationProvider, {
  useNavigationContext,
} from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

console.log(process.env)
import {
  ViewportDecorator,
  NotifyDecorator,
  MemoryRouterWrapper,
} from '../decorators'

export const SessionInfo = () => {
  const { getSession, endSession } = useSessionContext()
  const session = getSession()
  return (
    <React.Fragment>
      <View borderVariant="thinLight" paddingVariant="small" mb="small">
        <pre data-test-session>{JSON.stringify(session, null, 2)}</pre>
      </View>
      <Button onPress={endSession} data-test-id="logoutButton">
        Logout
      </Button>
    </React.Fragment>
  )
}

const LoginDemo = () => {
  const { location } = useNavigationContext()
  const { pathname } = location
  return (
    <ServiceProvider actions={{ session: actions }}>
      <SessionProvider signUp={pathname === '/signup'}>
        <List verticalItemPadding="small">
          <Text variant="uiTextNormalSemibold" data-test-id="authorized">
            Authorized
          </Text>
          <SessionInfo />
        </List>
      </SessionProvider>
    </ServiceProvider>
  )
}

const LoginDemoWithNavigation = () => (
  <NavigationProvider>
    <LoginDemo />
  </NavigationProvider>
)

storiesOf('Modules|Login', module)
  .addDecorator(NotifyDecorator)
  .addDecorator(ViewportDecorator)
  .add('login', () => (
    <MemoryRouterWrapper>
      <LoginDemoWithNavigation />
    </MemoryRouterWrapper>
  ))
  .add('signup', () => (
    <MemoryRouterWrapper initialPath="/signup">
      <LoginDemoWithNavigation />
    </MemoryRouterWrapper>
  ))
