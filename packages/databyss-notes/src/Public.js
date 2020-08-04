import React from 'react'
import Homepage from '@databyss-org/ui/modules/Homepage/Homepage'
import Login from '@databyss-org/ui/modules/Login/Login'
import { Router } from '@reach/router'

const Public = () => (
  <Router style={{ width: '100%' }}>
    <Homepage path="/" />
    <Login path="/login" />
    <Login signupFlow path="/signup" />
  </Router>
)

export default Public
