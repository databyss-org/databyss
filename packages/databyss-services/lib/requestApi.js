import request from './request'
import { getAuthToken, getAccountId } from './../session/clientStorage'
import { getAccountFromLocation } from '../session/_helpers'
import { version as databyssVersion } from './../package.json'

export const requestApi = (path, options = { headers: {} }, responseIsJson) => {
  // get current databyss version
  const _accountId = getAccountId()
  const _accountFromLocation = getAccountFromLocation()

  // If accountId in local storage same as account from location
  //   only include x-databyss-account else only include x-databyss-as-account.
  // Exclude storybook context
  // If account is not in location, we may still be redirecting from '/', so
  //   use the account in local storage (assume private)
  const _account =
    process.env.STORYBOOK ||
    !_accountFromLocation ||
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
        'x-databyss-version': databyssVersion,
        ..._account,
      },
    },
    responseIsJson
  )
}

// export const ping = (timeout) => requestApi(`/ping`, { timeout })

export const httpGet = (path) => requestApi(path)

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
