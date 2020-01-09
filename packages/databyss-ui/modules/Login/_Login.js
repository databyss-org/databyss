import React, { useState } from 'react'
import { GoogleLogin } from 'react-google-login'
import { TextInput } from '@databyss-org/ui/primitives'
import Text from '@databyss-org/ui/primitives/Text/Text'
import Button from '@databyss-org/ui/primitives/Button/Button'

const Login = ({
  registerWithEmail,
  checkToken,
  setGoogleAuthToken,
  checkCode,
  getAuthToken,
}) => {
  const token = getAuthToken()
  if (token) {
    checkToken(token)
  }

  const [formData, setFormData] = useState({
    email: '',
    code: '',
  })

  const { email } = formData

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const [codeView, setCodeView] = useState(false)

  const onEmailSuccess = () => {
    setCodeView(true)
  }

  const onSubmit = async e => {
    e.preventDefault()
    registerWithEmail({ formData, onEmailSuccess })
  }

  const onCodeSubmit = async e => {
    e.preventDefault()
    checkCode(formData.code)
  }

  const responseGoogle = response => {
    if (response.tokenId) {
      const token = response.tokenId
      setGoogleAuthToken(token)
    }
  }

  const [emailView, setEmailView] = useState(false)
  const onLinkClick = e => {
    e.preventDefault()
    setEmailView(!emailView)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      {' '}
      <form
        noValidate
        style={{
          display: 'inline-grid',
          width: '50%',
          minWidth: '300px',
        }}
      >
        <Text style={{ textAlign: 'center' }}>Log In</Text>
        <GoogleLogin
          clientId="282602380521-soik6nealmn1vgu50ohc37vmors61b6h.apps.googleusercontent.com"
          buttonText="Login"
          render={renderProps => (
            <Button
              label="Continue with Google"
              buttonType="external"
              onClick={renderProps.onClick}
            />
          )}
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy="single_host_origin"
        />
        {emailView ? (
          <Text style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                borderBottom: '1px solid #000',
                lineHeight: '0.1em',
                margin: '10px 0 20px',
              }}
            >
              <span
                style={{
                  backgroundColor: '#FFF',
                  padding: '0 10px',
                }}
              >
                or
              </span>
            </div>
          </Text>
        ) : (
          <Text style={{ textAlign: 'center' }}>
            You can also{' '}
            <a href="" onClick={onLinkClick}>
              continue with email
            </a>
          </Text>
        )}

        {emailView &&
          !codeView && (
            <div style={{ width: '100%', display: 'inline-grid' }}>
              <Text>email</Text>
              <TextInput
                autoFocus
                id="outlined-email-input"
                type="email"
                required
                buttonType="external"
                value={email}
                placeholder="email"
                onChange={e => onChange(e)}
                name="email"
                autoComplete="email"
              />
              <Button
                label="Continue with Email"
                buttonType="external"
                onClick={onSubmit}
                type="submit"
              />
            </div>
          )}
        {codeView && (
          <div style={{ width: '100%', display: 'inline-grid' }}>
            <Text>email</Text>
            <TextInput
              autoFocus
              id="outlined-email-input"
              type="email"
              required
              buttonType="external"
              value={email}
              placeholder="email"
              onChange={e => onChange(e)}
              name="email"
              autoComplete="email"
            />
            <Text style={{ textAlign: 'center' }}>
              {' '}
              We just sent you a temporary login code. Please check your inbox.{' '}
            </Text>
            <TextInput
              autoFocus
              id="code"
              type="text"
              required
              buttonType="external"
              value=""
              placeholder="Paste your login code here"
              onChange={e => onChange(e)}
              name="code"
              autoComplete="code"
            />
            <Button
              label="Continue with Login Code"
              buttonType="external"
              onClick={onCodeSubmit}
              type="submit"
            />
          </div>
        )}
      </form>
    </div>
  )
}

export default Login
