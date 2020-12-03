import _ from 'lodash'

// TODO: Add native versions of these

export function setSession(session) {
  localStorage.setItem('databyss_session', session)
}

export function deleteSession() {
  localStorage.removeItem('databyss_session')
}

export function setAuthToken(value) {
  const token = value && !_.isEmpty(value.token) ? value.token : value

  localStorage.setItem('token', token)
}

export function getAuthToken() {
  return localStorage.getItem('token')
}

export function deleteAuthToken() {
  localStorage.removeItem('token')
}

// export function setAccountId(value) {
//   localStorage.setItem('account', value)
// }

export function getAccountId() {
  return localStorage.getItem('account')
}

export function deleteAccountId() {
  localStorage.removeItem('account')
}
