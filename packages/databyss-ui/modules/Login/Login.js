import React, { useState } from 'react'
import { Button, Text, View } from '@databyss-org/ui/primitives'
import TextInputField from '@databyss-org/ui/components/Form/TextInputField'
import FormFieldList from '@databyss-org/ui/components/Form/FormFieldList'
import ValueListProvider from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { GoogleLogin } from 'react-google-login'

const Login = () => {
  const { getSession, requestCode } = useSessionContext()
  const [values, setValues] = useState({
    email: {
      textValue: '',
    },
    code: {
      textValue: '',
    },
  })

  const onSubmit = ({ googleToken }) => {
    getSession({
      email: values.email.textValue,
      code: values.code.textValue,
      googleToken,
      retry: true,
    })
  }

  const onGoogleResponse = ({ tokenId }) =>
    tokenId && onSubmit({ googleToken: tokenId })

  const onChange = values => {
    console.log('ONCHANGE')
    setValues(values)
  }

  return (
    <ValueListProvider values={values} onChange={onChange} onSubmit={onSubmit}>
      <View widthVariant="form" alignItems="center">
        <Text variant="uiTextLarge">Login</Text>
        <FormFieldList mt="medium">
          <GoogleLogin
            clientId="282602380521-soik6nealmn1vgu50ohc37vmors61b6h.apps.googleusercontent.com"
            buttonText="Login"
            render={({ onClick }) => (
              <Button variant="primaryUi" onPress={onClick}>
                Continue with Google
              </Button>
            )}
            onSuccess={onGoogleResponse}
            onFailure={onGoogleResponse}
            cookiePolicy="single_host_origin"
          />
        </FormFieldList>
      </View>
    </ValueListProvider>
  )
}

export default Login
