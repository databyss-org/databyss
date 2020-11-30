import jwt from 'jsonwebtoken'
import User from '../models/User'
import Account from '../models/Account'
import { Users } from '@databyss-org/data/serverdbs'

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
  //  const user = await User.findOne({ _id: userId })
  if (!userId || !user) {
    throw new Error('Bad userId')
  }
  const account = 'dummyid'
  /*

 { 
   defaultGroup: aslkfjsafj
    groups: [ 
      {
        _id: asdlkjfdsaklfsdj
        name: 'string',
        username: aslkdjafslkjdsfs
        password: XXXXXXXXXX
      }
    ]
  }

  */
  // TODO: account will become group
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
