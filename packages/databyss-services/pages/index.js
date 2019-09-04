import { httpGet, httpPost } from '../lib/requestApi'

// TODO: Add native versions of these
export function setAccountId(value) {
  localStorage.setItem('account', value)
}

export function getAccountId() {
  return localStorage.getItem('account')
}

export function deleteAccountId() {
  setAccountId(null)
}

export const getPage = _id => httpGet(`/pages/${_id}`)

export const newAccountFromToken = () => httpPost(`/accounts/`)

export const getAccount = () => httpGet(`/accounts/`)

export const savePage = data => httpPost('/pages', { data })

export const loadPage = id => httpGet(`/pages/populate/${id}`)

export const seedPage = data => httpPost(`/pages/`, { data })

export const getAllPages = () => httpGet(`/pages/`)
