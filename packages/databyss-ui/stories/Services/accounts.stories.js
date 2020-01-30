import React from 'react'
import { storiesOf } from '@storybook/react'
import { Text } from '@databyss-org/ui/primitives'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import SessionProvider from '@databyss-org/services/session/SessionProvider'
import { SessionInfo } from '../Login/login.stories'
import { ViewportDecorator } from '../decorators'

storiesOf('Services|Auth', module)
  .addDecorator(ViewportDecorator)
  .add('Login', () => (
    <ServiceProvider>
      <SessionProvider>
        <Text variant="uiTextNormalSemibold" data-test-id="authorized">
          Authorized
        </Text>
        <SessionInfo />
      </SessionProvider>
    </ServiceProvider>
  ))
