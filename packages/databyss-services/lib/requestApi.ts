import request, { RequestOptions, FETCH_TIMEOUT } from './request'
import { getAccountId, getAuthToken } from './../session/clientStorage'
// import { getAccountFromLocation } from '../session/utils'
import { version as databyssVersion } from './../version'

export const requestApi = async (
  path: string,
  options: RequestOptions = { headers: {} }
) => {
  const _accountId = getAccountId()
  // const _accountFromLocation = getAccountFromLocation()
  const _token = await getAuthToken()

  // TODO: update account headers for new CouchDB groups architecture

  // If accountId in local storage same as account from location
  //   only include x-databyss-account else only include x-databyss-as-account.
  // Exclude storybook context
  // If account is not in location, we may still be redirecting from '/', so
  //   use the account in local storage (assume private)

  // const _account =
  //   process.env.STORYBOOK ||
  //   !_accountFromLocation ||
  //   _accountId === _accountFromLocation
  //     ? {
  //         'x-databyss-account': `${_accountId}`,
  //       }
  //     : { 'x-databyss-as-account': `${getAccountFromLocation()}` }

  return request(process.env.API_URL + path, {
    ...options,
    headers: {
      ...options.headers,
      'x-auth-token': `${_token}`,
      'x-databyss-version': databyssVersion,
      'x-databyss-account': `${_accountId}`,
    },
    timeout: options.timeout || FETCH_TIMEOUT * 3,
  })
}

export const httpGet = async (path: string) => requestApi(path)

export const httpPost = async (path: string, body: any) =>
  requestApi(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpPut = (path: string, body: any) =>
  requestApi(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpPatch = (path: string, body: any) =>
  requestApi(path, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpDelete = (path: string) =>
  requestApi(path, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

export default httpGet
