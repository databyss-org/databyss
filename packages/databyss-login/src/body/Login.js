import React, { useState } from 'react'
import { GoogleLogin } from 'react-google-login'
import TextInput from '@databyss-org/ui/primitives/TextInput/TextInput'
import Button from '@databyss-org/ui/primitives/Button/Button'
import { getAuthToken } from '@databyss-org/services/lib/auth'
import { registerWithEmail, checkToken, setGoogleAuthToken } from './../actions'

const Login = ({ match }) => {
  localStorage.clear()
  if (match.params.id) {
    checkToken(match.params.id)
  }

  const token = getAuthToken()
  if (token) {
    checkToken(token)
  }

  const [formData, setFormData] = useState({
    email: '',
  })

  const { email } = formData

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async e => {
    e.preventDefault()
    registerWithEmail(formData)
  }

  const responseGoogle = response => {
    if (response.tokenId) {
      const token = response.tokenId
      setGoogleAuthToken(token)
      // window.location = '/'
    }
  }

  return (
    <div
      fluid
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
        <TextInput
          autoFocus
          id="outlined-email-input"
          type="email"
          required
          value={email}
          placeholder="email"
          onChange={e => onChange(e)}
          name="email"
          autoComplete="email"
        />
        <Button
          label="Sign in with Email"
          buttonType="primary"
          onClick={onSubmit}
          type="submit"
        />
        <GoogleLogin
          clientId="282602380521-soik6nealmn1vgu50ohc37vmors61b6h.apps.googleusercontent.com"
          buttonText="Login"
          render={renderProps => (
            <Button
              label="Sign in with Google"
              buttonType="external"
              onClick={renderProps.onClick}
            />
          )}
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy="single_host_origin"
        />
      </form>
    </div>
  )
}

export default Login
