import React from 'react'
import { storiesOf } from '@storybook/react'
import GoogleLoginButton from '@databyss-org/ui/components/Login/GoogleLoginButton'
import { ViewportDecorator } from '../decorators'

storiesOf('Components|Login', module)
  .addDecorator(ViewportDecorator)
  .add('Google Login Button', () => (
    <GoogleLoginButton
      onSuccess={(arg1, arg2) => {
        console.log('Signed in', arg1, arg2)
      }}
      onFailure={(error) => {
        console.log('Error signing in', error)
      }}
      width="50%"
      onPress={() => {
        console.log('pressed')
      }}
    >
      Sign in with Google
    </GoogleLoginButton>
  ))
