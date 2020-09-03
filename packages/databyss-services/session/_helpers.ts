import mongoose from 'mongoose'

export const getAccountFromLocation = (): string | bool => {
  const accountId = window.location.pathname.split('/')[1]
  if (mongoose.Types.ObjectId.isValid(accountId)) {
    return accountId
  }
  return false
}
