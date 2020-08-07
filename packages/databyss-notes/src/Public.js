import React from 'react'
import Homepage from '@databyss-org/ui/modules/Homepage/Homepage'
import { Router } from '@reach/router'

const Public = () => (
  <Router style={{ width: '100%' }}>
    <Homepage path="/" />
  </Router>
)

export default Public
