import axios from 'axios'

axios.defaults.baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://thawing-mountain-34862.herokuapp.com'

export const setAuthToken = token => {
  if (token) {
    // check to see if token is valid
    // redirect
    // localStorage.setItem('token', token)
  }
}

export const setGoogleAuthToken = ({ token, history }) => {
  if (token) {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${
          localStorage.googleToken
        }`
      )
      .then(response => {
        if (response.data.sub) {
          // setGoogleAuthToken(response.data.sub)
          console.log(response.data.sub)
        }
      })
      .catch(err => console.log(err))
  }
}

export const saveGoogleToken = token => {
  localStorage.setItem('googleToken', token)
}
