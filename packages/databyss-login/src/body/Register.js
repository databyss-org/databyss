import React, { useState } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
// import Grid from '@material-ui/core/Grid'
import TextInput from '@databyss-org/ui/primitives/TextInput/TextInput'
import Buttons from '@databyss-org/ui/primitives/Button/Button'
import { register } from './../actions'

/*
form style 

    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
*/

const Register = ({ history }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  const { firstName, lastName, email, password } = formData

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = async e => {
    e.preventDefault()
    register({ formData, history })
  }

  return (
    <Row middle="xs" style={{ height: '90vh' }}>
      <Col xs={12}>
        <Row around="xs">
          <Col xs={12}>
            {' '}
            <form
              noValidate
              style={{
                display: 'inline-grid',
                width: '50%',
                minWidth: '300px',
              }}
            >
              <Grid>
                <Grid>
                  <TextInput
                    autoFocus
                    id="firstName"
                    label="First name"
                    placeholder="First Name"
                    required
                    value={firstName}
                    name="firstName"
                    onChange={e => onChange(e)}
                    autoComplete="fname"
                  />
                </Grid>
                <Grid>
                  <TextInput
                    id="lastName"
                    label="Last name"
                    placeholder="Last Name"
                    required
                    value={lastName}
                    name="lastName"
                    onChange={e => onChange(e)}
                    autoComplete="lname"
                  />
                </Grid>
                <Grid>
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
                </Grid>
                <Grid>
                  <TextInput
                    id="outlined-password-input"
                    label="Password"
                    type="password"
                    placeholder="password"
                    required
                    value={password}
                    name="password"
                    onChange={e => onChange(e)}
                    autoComplete="current-password"
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              <Buttons
                label="Sign In"
                buttonType="primary"
                onClick={onSubmit}
                type="submit"
              />
              <Grid>
                <Grid>
                  <Buttons
                    label="Already have an account? Sign in"
                    buttonType="link"
                    onClick={() => history.push('/login')}
                  />
                </Grid>
              </Grid>
            </form>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default Register
