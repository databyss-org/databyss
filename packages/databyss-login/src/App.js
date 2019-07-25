import React from 'react'
import ThemeProvider from '@databyss-org/ui/theming/ThemeProvider'
import { checkToken } from './actions'
import Button from '@material-ui/core/Button'
import { setAuthToken, setGoogleAuthToken } from './utils/setAuthToken'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import Header from './header'
import Body from './body'
import Login from './body/Login'
import Register from './body/Register'

import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

if (localStorage.token) {
  const token = localStorage.getItem('token')
  checkToken(token)
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
