import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
// import { checkForPublicAccount } from './_helpers'

dotenv.config()

export async function authMiddleware(req, res, next) {
  // check if current account is public account

  // TODO: THIS WILL BE REPLPACED IN REFACTOR
  // const reqHasSharedAccount = await checkForPublicAccount(req)

  // if (reqHasSharedAccount) {
  //   return next()
  // }

  // Get token from header
  const token = req.header('x-auth-token')
  // Check if not token
  if (!token || token === 'null') {
    return res.status(401).json({ msg: 'No token, authorization denied' })
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      ...decoded.user,
      _id: decoded.user.id,
    }
    return next()
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' })
  }
}
