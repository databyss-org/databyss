import React, { useState } from 'react'
import { GoogleLogin } from 'react-google-login'
import { Route, Redirect, withRouter } from 'react-router'
import { Row, Col } from 'react-flexbox-grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import { makeStyles } from '@material-ui/core/styles'
import { login, setGoogleAuthToken } from './../actions'

import { saveGoogleToken } from './../utils/setAuthToken'

const useStyles = makeStyles(theme => ({
  submit: {
    marginTop: '16px',
    marginBottom: '16px',
  },
  googleButton: {
    backgroundColor: 'red',
    marginTop: '16px',
    marginBottom: '16px',
  },
}))

const Login = ({ history }) => {
  const classes = useStyles()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async e => {
    e.preventDefault()
    login({ formData, history })
  }

  const responseGoogle = response => {
    if (response.tokenId) {
      const token = response.tokenId
      saveGoogleToken(token)
      setGoogleAuthToken({ token, history })

      history.push('/')
    }
  }

  return (
    <Row middle="xs" style={{ height: '90vh' }}>
      <Col xs={12}>
        <Row around="xs">
          <Col xs={12}>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>

            <form
              noValidate
              autoComplete="off"
              style={{
                display: 'inline-grid',
                width: '50%',
                minWidth: '300px',
              }}
            >
              <TextField
                autoFocus
                id="outlined-email-input"
                label="Email"
                type="email"
                required
                value={email}
                onChange={e => onChange(e)}
                name="email"
                autoComplete="email"
                margin="normal"
                variant="outlined"
              />
              <TextField
                id="outlined-password-input"
                label="Password"
                type="password"
                required
                value={password}
                name="password"
                onChange={e => onChange(e)}
                autoComplete="current-password"
                margin="normal"
                variant="outlined"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                onClick={onSubmit}
                className={classes.submit}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
              <div>
                <GoogleLogin
                  clientId="364426797891-ebkvbpfkpdoh3kb9451b30s5etqq04km.apps.googleusercontent.com"
                  buttonText="Login"
                  render={renderProps => (
                    <Button
                      onClick={renderProps.onClick}
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.googleButton}
                    >
                      Sign in with Google
                    </Button>
                  )}
                  onSuccess={responseGoogle}
                  onFailure={responseGoogle}
                  cookiePolicy={'single_host_origin'}
                />
              </div>
            </form>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default withRouter(Login)
