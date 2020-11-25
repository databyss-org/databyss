import jwt from 'jsonwebtoken'
import User from '../models/User'
import Account from '../models/Account'
import Cloudant from '@cloudant/cloudant'

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

const cloudant = Cloudant({
  account: process.env.CLOUDANT_USERNAME,
  password: process.env.CLOUDANT_PASSWORD,
})

export const getSessionFromUserId = async (userId) => {
  const users = await cloudant.use('users')
  const user = await users.get(userId)
  //  const user = await User.findOne({ _id: userId })
  if (!userId || !user) {
    throw new Error('Bad userId')
  }
  const account = 'dummyid'
  // TODO
  // const account = await Account.findOne({ _id: user.defaultAccount })
  const token = await getTokenFromUserId(userId)
  return {
    token,
    user,
    account,
  }
}

export const getSessionFromToken = (token) => {
  const { user } = jwt.verify(token, process.env.JWT_SECRET)
  return getSessionFromUserId(user.id)
}
