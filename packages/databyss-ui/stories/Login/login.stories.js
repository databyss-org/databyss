import React from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text, List, Button } from '@databyss-org/ui/primitives'
import SessionProvider, {
  useSessionContext,
} from '@databyss-org/services/session/SessionProvider'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import * as actions from '@databyss-org/services/session/mocks/actions'
import { ViewportDecorator, NotifyDecorator } from '../decorators'

const SessionInfo = () => {
  const { getSession, endSession } = useSessionContext()
  const session = getSession()
  return (
    <React.Fragment>
      <View borderVariant="thinLight" paddingVariant="small" mb="small">
        <List>
          <Text variant="uiTextNormalSemibold">Session</Text>
          <Text>Account Name: {session.account.name}</Text>
          <Text>
            User Name: {session.user.firstName} {session.user.lastName}
          </Text>
        </List>
      </View>
      <Button onPress={endSession}>Logout</Button>
    </React.Fragment>
  )
}

storiesOf('Demos|Login', module)
  .addDecorator(NotifyDecorator)
  .addDecorator(ViewportDecorator)
  .add('mock', () => (
    <ServiceProvider actions={{ session: actions }}>
      <SessionProvider>
        <List verticalItemPadding="small">
          <Text variant="uiTextNormalSemibold">Authorized</Text>
          <SessionInfo />
        </List>
      </SessionProvider>
    </ServiceProvider>
  ))
