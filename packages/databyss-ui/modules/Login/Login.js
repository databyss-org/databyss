import React, { useState, useRef, useEffect } from 'react'
import { Button, Text, View, List } from '@databyss-org/ui/primitives'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import TextInputField from '@databyss-org/ui/components/Form/TextInputField'
import FormFieldList from '@databyss-org/ui/components/Form/FormFieldList'
import ValueListProvider from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { GoogleLogin } from 'react-google-login'
import { NotAuthorizedError } from '@databyss-org/services/lib/errors'

const initialFormState = {
  email: {
    textValue: '',
  },
  code: {
    textValue: '',
  },
}

const Login = ({ title, pending, resetFlow }) => {
  const { getSession, requestCode, session } = useSessionContext()
  const emailInputRef = useRef(null)
  const codeInputRef = useRef(null)
  const [isEmailFlow, setIsEmailFlow] = useState(false)
  const [didSubmit, setDidSubmit] = useState(false)
  const [showRequestCode, setShowRequestCode] = useState(requestCode)
  const [values, setValues] = useState(initialFormState)

  const onSubmit = ({ googleToken } = {}) => {
    if (
      (showRequestCode && !values.code.textValue.length) ||
      (isEmailFlow && !values.email.textValue.length)
    ) {
      return
    }
    getSession({
      email: values.email.textValue,
      code: values.code.textValue,
      googleToken,
      retry: true,
    })
    setDidSubmit(true)
  }

  const onGoogleRequest = cb => () => {
    setIsEmailFlow(false)
    setShowRequestCode(false)
    setValues(initialFormState)
    cb()
  }

  const onGoogleResponse = ({ tokenId }) =>
    tokenId && onSubmit({ googleToken: tokenId })

  const onChange = values => {
    setValues(values)
  }

  useEffect(
    () => {
      if (isEmailFlow && emailInputRef) {
        emailInputRef.current.focus()
      }
    },
    [isEmailFlow, emailInputRef]
  )

  useEffect(
    () => {
      if (showRequestCode && codeInputRef) {
        codeInputRef.current.focus()
      }
    },
    [showRequestCode, codeInputRef]
  )

  useEffect(
    () => {
      // reset TFA if email changes
      if (showRequestCode) {
        setValues({ ...values, code: { textValue: '' } })
        setShowRequestCode(false)
      }
    },
    [values.email.textValue]
  )

  useEffect(
    () => {
      if (!showRequestCode && requestCode) {
        setShowRequestCode(true)
      }
    },
    [requestCode]
  )

  return (
    <ValueListProvider values={values} onChange={onChange} onSubmit={onSubmit}>
      <View widthVariant="dialog" alignItems="center">
        <Text variant="heading2" color="gray.3">
          {title}
        </Text>
        <List mt="medium" mb="medium" verticalItemPadding="medium" width="100%">
          <GoogleLogin
            clientId="282602380521-soik6nealmn1vgu50ohc37vmors61b6h.apps.googleusercontent.com"
            buttonText="Login"
            render={({ onClick }) => (
              <Button
                variant="primaryUi"
                onPress={onGoogleRequest(onClick)}
                disabled={pending}
              >
                Continue with Google
              </Button>
            )}
            onSuccess={onGoogleResponse}
            onFailure={onGoogleResponse}
            cookiePolicy="single_host_origin"
          />
          {isEmailFlow ? (
            <FormFieldList mt="none">
              <View>
                <View hlineVariant="thinLight" />
              </View>
              <TextInputField
                label="Email"
                path="email"
                placeholder="Enter your email address"
                ref={emailInputRef}
              />
              {showRequestCode && (
                <React.Fragment>
                  <View alignItems="center">
                    <Text variant="uiTextNormal">
                      We just sent you a temporary login code.
                    </Text>
                    <Text variant="uiTextNormal">Please check your inbox.</Text>
                  </View>
                  <TextInputField
                    path="code"
                    placeholder="Paste login code"
                    ref={codeInputRef}
                  />
                </React.Fragment>
              )}
              <View>
                <Button
                  variant="secondaryUi"
                  onPress={onSubmit}
                  disabled={
                    pending ||
                    (showRequestCode && !values.code.textValue.length) ||
                    !values.email.textValue.length
                  }
                >
                  {pending ? (
                    <Loading size={20} />
                  ) : (
                    `Continue with ${showRequestCode ? 'Login Code' : 'Email'}`
                  )}
                </Button>
              </View>
              {didSubmit &&
                session instanceof NotAuthorizedError && (
                  <View alignItems="center">
                    <Text color="red.0" variant="uiTextNormal">
                      {showRequestCode
                        ? 'Code is invalid or expired'
                        : 'Please enter a valid email'}
                    </Text>
                  </View>
                )}
            </FormFieldList>
          ) : (
            <View
              flexDirection="horizontal"
              alignItems="center"
              justifyContent="center"
            >
              <Text variant="uiTextNormal" mr="tiny" color="gray.3">
                You can also
              </Text>
              <Button variant="uiLink" onPress={setIsEmailFlow}>
                continue with email
              </Button>
            </View>
          )}
        </List>
        <View flexDirection="horizontal" alignItems="center">
          <Text variant="uiTextSmall" mr="tiny" color="gray.3">
            Don't have an account?
          </Text>
          <Button variant="uiLink" textVariant="uiTextSmall" href="/signup">
            Sign Up
          </Button>
        </View>
      </View>
    </ValueListProvider>
  )
}

Login.defaultProps = {
  title: 'Log In',
}

export default Login
