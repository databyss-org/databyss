import { delay } from '../lib/mocks'

// TODO: Add native versions of these
export function setAuthToken(value) {
  localStorage.setItem('token', value)
}

export function getAuthToken() {
  return localStorage.getItem('token')
}

export function deleteAuthToken() {
  setAuthToken(null)
}

export const login = async () => {
  await delay(2)
  return true
}

export const checkToken = async () => {
  await delay(2)
  return true
}

export const checkCode = async () => {
  await delay(2)
  return true
}

export const registerWithEmail = async () => {
  await delay(2)
  return true
}

export const setGoogleAuthToken = async () => {
  await delay(2)
  return true
}
