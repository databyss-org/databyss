import Account from '../models/Account'
import Page from '../models/Page'

import { checkForPublicAccount } from './_helpers'

function checkRequiredRoles(requiredRoles, userRoles) {
  return requiredRoles.filter(value => userRoles.includes(value)).length > 0
}

const accountMiddleware = requiredRoles => async (req, res, next) => {
  // if in shared account, favor shared account
  // check required roles for 'PUBLIC'
  if (req.asAccount && checkRequiredRoles(requiredRoles, 'PUBLIC')) {
    const pageResponse = await Page.find({
      'sharedWith.account': req.asAccount,
    })
    if (pageResponse) {
      req.publicPages = pageResponse
      return next()
    }
  }

  // get account id from header
  const accountId = req.header('x-databyss-account')

  const account = await Account.findOne({ _id: accountId })
  if (!account) {
    return res.status(400).json({ msg: 'no account found' })
  }
  const accountUser = account.users.find(
    user => user._id.toString() === req.user.id.toString()
  )

  if (!accountUser) {
    return res.status(401).json({ msg: 'authorization denied' })
    //	throw new ApiError('not authorized', 401)
  }

  // add required roles and user account roles
  if (!checkRequiredRoles(requiredRoles, accountUser.role)) {
    return res.status(401).json({ msg: 'authorization denied' })
    //	throw new ApiError('not authorized', 401)
  }
  req.account = account

  return next()
}

export default accountMiddleware
