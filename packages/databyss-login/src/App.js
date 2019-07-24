import React from 'react'
import ThemeProvider from '@databyss-org/ui/theming/ThemeProvider'
import Button from '@material-ui/core/Button'
import { setAuthToken, setGoogleAuthToken } from './utils/setAuthToken'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import Header from './header'
import Body from './body'
import Login from './body/Login'
import Register from './body/Register'

import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

import './App.css'

if (localStorage.googleToken) {
  console.log(localStorage.googleToken)
  axios
    .get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${
        localStorage.googleToken
      }`
    )
    .then(response => {
      if (response.data.sub) {
        setGoogleAuthToken(response.data.sub)
        console.log(response.data.sub)
      }
    })
    .catch(err => console.log(err))
}

if (localStorage.token) {
  console.log(localStorage.token)
}

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Router>
          <Header />
          <div>
            <div>
              <Route exact path="/" component={Body} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
            </div>
          </div>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default App
