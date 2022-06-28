import React, { useState, useRef, useEffect } from 'react'
import { Button, Text, View } from '@databyss-org/ui/primitives'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import TextInputField from '@databyss-org/ui/components/Form/TextInputField'
import FormFieldList from '@databyss-org/ui/components/Form/FormFieldList'
import ValueListProvider from '@databyss-org/ui/components/ValueList/ValueListProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import GoogleLoginButton from '@databyss-org/ui/components/Login/GoogleLoginButton'
import { NotAuthorizedError } from '@databyss-org/services/interfaces'
import { pxUnits } from '@databyss-org/ui/theming/views'

const initialFormState = {
  email: {
    textValue: '',
  },
  code: {
    textValue: '',
  },
}

function validateEmail(email) {
  const re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

const Login = ({ pending, signupFlow }) => {
  const { getSession, requestCode, session } = useSessionContext()
  const emailInputRef = useRef(null)
  const codeInputRef = useRef(null)
  const [didSubmit, setDidSubmit] = useState(false)
  const [invalidEmail, setInvalidEmail] = useState(false)
  const [showRequestCode, setShowRequestCode] = useState(requestCode)
  const [values, setValues] = useState(initialFormState)

  const onSubmit = ({ googleCode } = {}) => {
    if (
      (showRequestCode && !values.code.textValue.length) ||
      (!googleCode && !values.email.textValue.length)
    ) {
      return
    }

    if (!googleCode && !validateEmail(values.email.textValue)) {
      setInvalidEmail(true)
      return
    }

    const _session = {
      email: values.email.textValue.toLowerCase(),
      code: values.code.textValue,
      googleCode,
      retry: true,
    }
    setDidSubmit(_session)
    getSession(_session)
  }

  const onGoogleRequest = () => {
    setShowRequestCode(false)
    setValues(initialFormState)
  }

  // const onGoogleResponse = ({ tokenId }) =>
  //   tokenId && onSubmit({ googleToken: tokenId })

  const onGoogleResponse = ({ code }) => code && onSubmit({ googleCode: code })

  const onChange = (values) => {
    setValues(values)
  }

  // autofocus the request code field when it is shown
  useEffect(() => {
    if (showRequestCode && codeInputRef) {
      codeInputRef.current.focus()
    }
  }, [showRequestCode, codeInputRef])

  // reset TFA (request code) if email changes
  useEffect(() => {
    // if valid email addres, enable button
    if (invalidEmail && validateEmail(values.email.textValue)) {
      setInvalidEmail(false)
    }

    if (showRequestCode) {
      setValues({ ...values, code: { textValue: '' } })
      setShowRequestCode(false)
      setDidSubmit(false)
    }
  }, [values.email.textValue])

  // auth response may contain the `requestCode` verb for TFA
  // if it does, show the request code UI
  useEffect(() => {
    if (!showRequestCode && requestCode) {
      setShowRequestCode(true)
    }
  }, [requestCode])

  const signInOrSignUp = signupFlow ? 'Sign up ' : 'Sign in '

  return (
    <>
      <ValueListProvider
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
      >
        <View
          widthVariant="dialog"
          alignItems="center"
          minWidth={pxUnits(320)}
          flexGrow={1}
          justifyContent="center"
          mb="extraLarge"
        >
          <Text variant="heading2" color="gray.3">
            {signupFlow ? 'Sign Up' : 'Log In'}
          </Text>
          <FormFieldList mt="medium" mb="medium" width="100%">
            <GoogleLoginButton
              data-test-id="googleButton"
              disabled={pending}
              onSuccess={onGoogleResponse}
              onFailure={onGoogleResponse}
              onPress={onGoogleRequest}
            >
              {signInOrSignUp}
              with Google
            </GoogleLoginButton>

            <View mt="medium" mb="small">
              <View hlineVariant="thinLight" />
            </View>
            <TextInputField
              textInputProps={{ type: 'email' }}
              label="Email"
              errorMessage={
                invalidEmail && 'Please enter a valid email address'
              }
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
                  textInputProps={{ autoCapitalize: 'none' }}
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
                  !values.email.textValue.length ||
                  invalidEmail
                }
                data-test-id="continueButton"
              >
                {pending ? (
                  <Loading
                    size={20}
                    showLongWaitMessage={
                      didSubmit?.code || didSubmit?.googleCode
                    }
                    splashOnLongWait
                    longWaitDialogOptions={{
                      nude: true,
                      message: 'Synchronizing your Databyss with the cloud...',
                    }}
                  />
                ) : (
                  `${signInOrSignUp} with ${
                    showRequestCode ? 'Login Code' : 'Email'
                  }`
                )}
              </Button>
            </View>
            {didSubmit && session instanceof NotAuthorizedError && (
              <View alignItems="center">
                <Text
                  color="red.0"
                  variant="uiTextNormal"
                  data-test-id="errorMessage"
                >
                  {showRequestCode
                    ? 'Code is invalid or expired'
                    : 'Please enter a valid email'}
                </Text>
              </View>
            )}
          </FormFieldList>
          <View flexDirection="horizontal" alignItems="center">
            <Text variant="uiTextSmall" mr="tiny" color="gray.3">
              {signupFlow
                ? 'Already have an account?'
                : "Don't have an account?"}
            </Text>
            <Button
              variant="uiLink"
              textVariant="uiTextSmall"
              href={signupFlow ? '/' : '/signup'}
            >
              {signupFlow ? 'Log In' : 'Sign Up'}
            </Button>
          </View>
        </View>
      </ValueListProvider>
    </>
  )
}

Login.defaultProps = {
  title: 'Log In',
}

export default Login
