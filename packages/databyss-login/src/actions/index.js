import axios from 'axios'

export const login = async ({ formData, history }) => {
  console.log(formData)
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
          console.log(response.data)
          const config = {
            headers: {
              'Content-Type': 'application/json',
            },
          }
          const body = JSON.stringify({ token })

          try {
            const res = await axios.post('/api/profile/google', body, config)
            if (res.status === 200) {
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
