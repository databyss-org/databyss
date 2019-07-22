import React from 'react'
import { GoogleLogin } from 'react-google-login'
import { setAuthToken, setGoogleAuthToken } from './../utils/setAuthToken'

const responseGoogle = response => {
  const token = response.tokenId
  setGoogleAuthToken(token)
  /*
    axios
      .get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
      .then(function(response) {
        // handle success
        console.log(response.data)
      })
      .catch(err => console.log(err))
      */
}

const Body = () => {
  return <div>stuff</div>
}

export default Body
