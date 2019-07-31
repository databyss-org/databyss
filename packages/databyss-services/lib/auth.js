import axios from 'axios'

export function setAuthToken(value) {
  localStorage.setItem('token', value)
}

export function getAuthToken() {
  return localStorage.getItem('token')
}

export function deleteAuthToken() {
  setAuthToken(null)
}

export const login = async ({ email, password }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const body = JSON.stringify({ email, password })

  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth`,
      body,
      config
    )
    if (res.status === 200) {
      setAuthToken(res.data)
      return true
    }
  } catch (err) {
    const errors = err.response.data.errors
    console.log(errors[0].msg)
  }
  return false
}

export const checkToken = async token => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  try {
    axios.defaults.headers.common['x-auth-token'] = token
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/auth`,
      {},
      config
    )
    if (res.status === 200) {
      setAuthToken(token)
      return true
    }
  } catch (err) {
    // const errors = err.response.data.errors
    console.log(err)
  }
  return false
}

export const checkCode = async code => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const body = JSON.stringify({ code })
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/code`,
      body,
      config
    )

    if (res.status === 200) {
      setAuthToken(res.data.token)
      return true
    }
  } catch (err) {
    // const errors = err.response.data.errors
    console.log(err)
  }
  return false
}

export const register = async ({ firstName, lastName, email, password }) => {
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
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/users`,
      body,
      config
    )
    if (res.status === 200) {
      setAuthToken(res.data.token)
      return true
    }
  } catch (err) {
    const errors = err.response.data.errors
    console.log(errors[0].msg)
  }
  return false
}

export const registerWithEmail = async ({ email }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  const body = JSON.stringify({
    // name: `${firstName} ${lastName}`,
    email,
  })
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/users/email`,
      body,
      config
    )
    if (res.status === 200) {
      return true
    }
  } catch (err) {
    const errors = err.response.data.errors
    console.log(errors[0].msg)
  }
  return false
}

export const setGoogleAuthToken = async token => {
  if (token) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': '*',
      },
    }
    const body = JSON.stringify({ token })
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/google`,
        body,
        config
      )
      if (res.status === 200) {
        setAuthToken(res.data.token)
        return true
      }
    } catch (err) {
      console.log(err)
    }
  }
  return false
}
