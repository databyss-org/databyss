import request from './request'
import { getAuthToken, getAccountId } from './../session/clientStorage'
import { getAccountFromLocation } from '../session/_helpers'

export const ping = () =>
  request(`${process.env.API_URL}/ping/`, { timeout: 5000 })

export const requestApi = (path, options = { headers: {} }, responseIsJson) => {
  const _accountId = getAccountId()
  const _accountFromLocation = getAccountFromLocation()

  // if getaccountid same as account from location only include x-databyss-account else only include x-databyss-as-account
  // does not apply to storybook login
  const _account =
    _accountId === _accountFromLocation || process.env.STORYBOOK
      ? {
          'x-databyss-account': `${getAccountId()}`,
        }
      : { 'x-databyss-as-account': `${getAccountFromLocation()}` }

  return request(
    process.env.API_URL + path,
    {
      ...options,
      headers: {
        ...options.headers,
        'x-auth-token': `${getAuthToken()}`,
        ..._account,
      },
    },
    responseIsJson
  )
}

export const httpGet = path => requestApi(path)

export const httpPost = (path, body) =>
  requestApi(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpPut = (path, body) =>
  requestApi(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpPatch = (path, body) =>
  requestApi(path, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpDelete = (path, body) =>
  requestApi(path, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export default httpGet
