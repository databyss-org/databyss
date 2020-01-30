import jwt from 'jsonwebtoken'
import User from '../models/User'
import Account from '../models/Account'

export const getTokenFromUserId = userId =>
  new Promise((resolve, reject) =>
    jwt.sign(
      { user: { id: userId } },
      process.env.JWT_SECRET,
      { expiresIn: '1y' },
      (err, token) => {
        if (err) {
          reject(err)
        }
        resolve(token)
      }
    )
  )

export const getSessionFromUserId = async userId => {
  const user = await User.findOne({ _id: userId })
  if (!userId) {
    throw new Error('Bad userId')
  }
  const account = await Account.findOne({ _id: user.defaultAccount })
  const token = await getTokenFromUserId(userId)
  return {
    token,
    user,
    account,
  }
}

export const getSessionFromToken = token => {
  const { user } = jwt.verify(token, process.env.JWT_SECRET)
  return getSessionFromUserId(user.id)
}
