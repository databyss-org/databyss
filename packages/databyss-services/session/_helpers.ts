// import mongoose from 'mongoose'

export const getAccountFromLocation = (): string | boolean => {
  const accountId = window.location.pathname.split('/')[1]
  // TODO: this should be migrated over to new ID system
  if (accountId.length) {
    return accountId
  }

  return false
}
