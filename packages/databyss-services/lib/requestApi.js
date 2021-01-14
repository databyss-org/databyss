import request from './request'
import { getAccountId, getAuthToken } from './../session/clientStorage'
import { getAccountFromLocation } from '../session/_helpers'
import { version as databyssVersion } from './../package.json'

export const requestApi = async (
  path,
  options = { headers: {} },
  responseIsJson
) => {
  // get current databyss version
  const _accountId = await getAccountId()

  const _accountFromLocation = getAccountFromLocation()

  const _token = await getAuthToken()

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
          'x-databyss-account': `${_accountId}`,
        }
      : { 'x-databyss-as-account': `${getAccountFromLocation()}` }

  return request(
    process.env.API_URL + path,
    {
      ...options,
      headers: {
        ...options.headers,
        'x-auth-token': `${_token}`,
        'x-databyss-version': databyssVersion,
        ..._account,
      },
    },
    responseIsJson
  )
}

export const httpGet = async (path) => requestApi(path)

export const httpPost = async (path, body) =>
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
