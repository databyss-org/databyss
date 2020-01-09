import _ from 'lodash'

// TODO: Add native versions of these
export function setAuthToken(value) {
  const token = !_.isEmpty(value.token) ? value.token : value

  localStorage.setItem('token', token)
}

export function getAuthToken() {
  return localStorage.getItem('token')
}

export function deleteAuthToken() {
  setAuthToken(null)
}

export function setAccountId(value) {
  localStorage.setItem('account', value)
}

export function getAccountId() {
  return localStorage.getItem('account')
}

export function deleteAccountId() {
  setAccountId(null)
}
