import jwt from 'jsonwebtoken'
import { Users, Groups } from '@databyss-org/data/serverdbs'

export const getTokenFromUserId = (userId) =>
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

export const getSessionFromUserId = async (userId) => {
  const user = await Users.get(userId)
  if (!userId || !user) {
    throw new Error('Bad userId')
  }

  // TODO: account will become group
  // const account = await Account.findOne({ _id: user.defaultAccount })
  const token = await getTokenFromUserId(userId)
  return {
    token,
    user,
  }
}

export const getSessionFromToken = (token) => {
  const { user } = jwt.verify(token, process.env.JWT_SECRET)
  return getSessionFromUserId(user.id)
}
