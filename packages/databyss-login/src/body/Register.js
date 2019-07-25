import React, { useState } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { Link as RouterLink } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import TextInput from '@databyss-org/ui/primitives/TextInput/TextInput'
import Buttons from '@databyss-org/ui/primitives/Button/Button'
import { register } from './../actions'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

const Register = ({ history }) => {
  const classes = useStyles()

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

  console.log(formData)
  return (
    <Row middle="xs" style={{ height: '90vh' }}>
      <Col xs={12}>
        <Row around="xs">
          <Col xs={12}>
            {' '}
            <form
              className={classes.form}
              noValidate
              style={{
                display: 'inline-grid',
                width: '50%',
                minWidth: '300px',
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextInput
                    autoFocus
                    id="firstName"
                    label="First name"
                    placeholder="First Name"
                    required
                    value=""
                    name="firstName"
                    onChange={e => onChange(e)}
                    autoComplete="fname"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextInput
                    id="lastName"
                    label="Last name"
                    placeholder="Last Name"
                    required
                    value=""
                    name="lastName"
                    onChange={e => onChange(e)}
                    autoComplete="lname"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    autoFocus
                    id="outlined-email-input"
                    type="email"
                    required
                    value=""
                    placeholder="email"
                    onChange={e => onChange(e)}
                    name="email"
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    id="outlined-password-input"
                    label="Password"
                    type="password"
                    placeholder="password"
                    required
                    value=""
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
              <Grid container justify="flex-end">
                <Grid item>
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
