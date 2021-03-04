// import mongoose from 'mongoose'

export const getAccountFromLocation = (): string | boolean => {
  try {
    // TODO: validate URL patterns
    const accountId = window.location.pathname.split('/')[1]
    if (accountId.length) {
      return accountId
    }
  } catch (_) {
    return false
  }

  return false
}
