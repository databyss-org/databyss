import { Base64 } from 'js-base64'
import request, { RequestOptions } from './request'
import { getPouchSecret } from './../session/clientStorage'

export interface RequestCouchOptions extends RequestOptions {
  /**
   * If set, will use this group id as the key for 'pouch_secret' dictionary to get
   * database credentials. Otherwise, will use the first entry in the dictionary
   */
  authenticateAsGroupId?: string
}

/**
 * Wrapper for CouchDB HTTP calls that populates the authorization headers
 * and parses the response as JSON
 * @param path Raw path to the endpoint, appended to the host
 * @param options WHATWG fetch request options
 */
export const requestCouch = async (
  path: string,
  options: RequestCouchOptions = { headers: {} }
) => {
  const { authenticateAsGroupId } = options
  const _secrets = getPouchSecret()
  const _groupId = authenticateAsGroupId || Object.keys(_secrets)[0]
  const { dbKey: _username, dbPassword: _password } = _secrets[_groupId]

  return request(`https://${process.env.CLOUDANT_HOST}/${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Basic ${Base64.btoa(`${_username}:${_password}`)}`,
    },
  })
}

export const couchGet = async (path: string, options?: RequestCouchOptions) =>
  requestCouch(path, options)

export const couchPost = async (
  path: string,
  body: any,
  options: RequestCouchOptions = {}
) =>
  requestCouch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    ...options,
  })

export const couchPut = async (
  path: string,
  body: any,
  options: RequestCouchOptions = {}
) =>
  requestCouch(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    ...options,
  })

export const couchDelete = (
  path: string,
  body: any,
  options: RequestCouchOptions = {}
) =>
  requestCouch(path, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    ...options,
  })
