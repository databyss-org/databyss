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
import { ViewportDecorator, NotifyDecorator } from '../decorators'

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
  const { path } = useNavigationContext()
  return (
    <ServiceProvider actions={{ session: actions }}>
      <SessionProvider signUp={path === '/signup'}>
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

storiesOf('Demos|Login', module)
  .addDecorator(NotifyDecorator)
  .addDecorator(ViewportDecorator)
  .add('default', () => (
    <NavigationProvider>
      <LoginDemo />
    </NavigationProvider>
  ))
  .add('signup', () => (
    <NavigationProvider initialPath="/signup">
      <LoginDemo />
    </NavigationProvider>
  ))
