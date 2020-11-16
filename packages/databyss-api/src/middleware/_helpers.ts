import mongoose from 'mongoose'
import Account from '../models/Account'

export const checkForPublicAccount = async req => {
  const accountId = req.header('x-databyss-as-account')

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return false
  }

  if (accountId) {
    // check if account exists
    const _account = await Account.findOne({ _id: accountId })

    // if account exists return req.asAccount with account id
    if (_account) {
      req.asAccount = accountId
      return req
    }
  }
  // if it doesnt exist or is private, return false
  return false
}
