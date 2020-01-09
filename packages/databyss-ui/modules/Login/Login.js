import React, { useState } from 'react'
import { Button, Text, View } from '@databyss-org/ui/primitives'
import TextInputField from '@databyss-org/ui/components/Form/TextInputField'
import FormFieldList from '@databyss-org/ui/components/Form/FormFieldList'
import ValueListProvider from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'

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

  const onSubmit = () => {
    getSession({ email: values.email.textValue, code: values.code.textValue })
  }

  return (
    <ValueListProvider values={values} onChange={setValues} onSubmit={onSubmit}>
      <View widthVariant="form" alignItems="center">
        <Text variant="uiTextLarge">Login</Text>
        <FormFieldList mt="medium">
          <Button variant="primaryUi">Continue with Google</Button>
        </FormFieldList>
      </View>
    </ValueListProvider>
  )
}

export default Login
