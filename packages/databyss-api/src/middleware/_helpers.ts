import Account from '../models/Account'
import mongoose from 'mongoose'
import { InsufficientPermissionError } from '../lib/Errors'

// import { UnauthorizedError } from '../lib/Errors'

export const checkForPublicAccount = async (req) => {
  const accountId = req.header('x-databyss-as-account')

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return false
  }


  if (accountId) {
    // check if account exists
    const _account = await Account.findOne({ _id: accountId })
    // check it account is public
    // if account is public return token as req.asAccount
    if (_account?.isPublic) {
      req.asAccount = accountId
      return req
    } else {
      return new InsufficientPermissionError()
      // return res.status(401).json({ msg: 'Not authorized' })
    }
  }
  // if it doesnt exist or is private, return false
  return false
}
