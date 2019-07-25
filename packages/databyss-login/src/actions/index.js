import axios from 'axios'

export const login = async ({ formData, history }) => {
  const { email, password } = formData
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const body = JSON.stringify({ email, password })

  try {
    const res = await axios.post('/api/auth', body, config)
    if (res.status === 200) {
      history.push('/')
      localStorage.setItem('token', res.data)
      // REDIRECT HERE
    }
  } catch (err) {
    const errors = err.response.data.errors
    console.log(errors[0].msg)
  }
}

export const checkToken = async token => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  try {
    axios.defaults.headers.common['x-auth-token'] = token
    const res = await axios.get('/api/auth', {}, config)
    if (res.status === 200) {
      // REDIRECT HERE
      console.log('success')
    }
  } catch (err) {
    const errors = err.response.data.errors
    console.log(errors)
  }
}

export const register = async ({ formData, history }) => {
  const { firstName, lastName, email, password } = formData
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const body = JSON.stringify({
    name: `${firstName} ${lastName}`,
    email,
    password,
  })
  try {
    const res = await axios.post('/api/users', body, config)
    if (res.status === 200) {
      history.push('/')
      localStorage.setItem('token', res.data.token)
      // REDIRECT HERE
    }
  } catch (err) {
    const errors = err.response.data.errors
    console.log(errors[0].msg)
  }
}

export const setGoogleAuthToken = ({ token, history }) => {
  if (token) {
    axios
      .get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
      .then(async response => {
        if (response.data.sub) {
          const config = {
            headers: {
              'Content-Type': 'application/json',
            },
          }
          const body = JSON.stringify({ token })

          try {
            const res = await axios.post('/api/users/google', body, config)
            if (res.status === 200) {
              console.log(res.data)
              localStorage.setItem('token', res.data.token)
              console.log(res.data.token)
              history.push('/')
            }
          } catch (err) {
            console.log(err)
          }
        }
      })
      .catch(err => console.log(err))
  }
}
