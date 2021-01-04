import _ from 'lodash'

// TODO: Add native versions of these
export function setAuthToken(value) {
  const token = value && !_.isEmpty(value.token) ? value.token : value

  localStorage.setItem('token', token)
}

export function setCredentials(group) {
  localStorage.setItem('dbKey', group.dbKey)
  localStorage.setItem('dbPassword', group.dbPassword)
}

export function deleteCredentials() {
  localStorage.removeItem('dbKey')
  localStorage.removeItem('dbPassword')
}

export function getAuthToken() {
  return localStorage.getItem('token')
}

export function deleteAuthToken() {
  localStorage.removeItem('token')
}

export function setAccountId(value) {
  localStorage.setItem('account', value)
}

export function getAccountId() {
  return localStorage.getItem('account')
}

export function deleteAccountId() {
  localStorage.removeItem('account')
}

export function setDefaultPageId(value) {
  localStorage.setItem('defaultPageId', value)
}
