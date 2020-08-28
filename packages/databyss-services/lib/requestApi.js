import request from './request'
import {
  getAuthToken,
  getAccountId,
  getPublicAccountId,
} from './../session/clientStorage'
import { getAccountFromLocation } from '../session/_helpers'

export const ping = () => fetch(`${process.env.API_URL}/ping/`)

export const requestApi = (path, options = { headers: {} }, responseIsJson) => {
  // TODO:
  const _accountId = getAccountId()
  const _accountFromLocation = getAccountFromLocation()
  // if getaccountid same as account from location only include x-databyss-account else only include x-databyss-as-account
  const _account =
    _accountId === _accountFromLocation
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
