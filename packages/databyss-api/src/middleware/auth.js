import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// const config = require('config');

function auth(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token')

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' })
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    return next()
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' })
  }
}

export default auth
