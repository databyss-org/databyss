import React from 'react'
import { storiesOf } from '@storybook/react'
import { Text, View } from '@databyss-org/ui/primitives'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import { SessionInfo } from '../Login/login.stories'
import { ViewportDecorator } from '../decorators'

storiesOf('Services|Auth', module)
  .addDecorator(ViewportDecorator)
  .add('Login', () => (
    <View id="login-page">
      <ServiceProvider>
        <SessionProvider>
          <Text variant="uiTextNormalSemibold" data-test-id="authorized">
            Authorized
          </Text>
          <SessionInfo />
        </SessionProvider>
      </ServiceProvider>
    </View>
  ))
