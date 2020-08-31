import Account from '../models/Account'
import { UnauthorizedError } from '../lib/Errors'

export const checkForPublicAccount = async (req, res) => {
  const accountId = req.header('x-databyss-as-account')
  if (accountId) {
    // check if account exists
    const _account = await Account.findOne({ _id: accountId })
    // check it account is public
    // if account is public return token as req.asAccount
    if (_account?.isPublic) {
      req.asAccount = accountId
      return req
    } else {
      return res.status(401).json({ msg: 'Not authorized' })
    }
  }
  // if it doesnt exist or is private, return false
  return false
}
