import React from 'react'
import { checkToken } from './../actions'

const Body = ({ history }) => {
  if (localStorage.token) {
    const token = localStorage.getItem('token')
    checkToken({ token, history })
  }

  history.push('/login')
  return <div>REDIRECT</div>
}

export default Body
