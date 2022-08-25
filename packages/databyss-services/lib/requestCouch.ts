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

interface QueuedRequest {
  resolve: (value: any) => void
  reject: (reason: any) => void
  uri: string
  options: RequestOptions
}
const requestQ: QueuedRequest[] = []

/**
 * Wrapper for CouchDB HTTP calls that populates the authorization headers
 * and parses the response as JSON
 * @param path Raw path to the endpoint, appended to the host
 * @param options WHATWG fetch request options
 */
export const requestCouch = (
  path: string,
  options: RequestCouchOptions = { headers: {} }
) => {
  const { authenticateAsGroupId } = options
  const _secrets = getPouchSecret()
  const _groupId = _secrets
    ? authenticateAsGroupId || (_secrets && Object.keys(_secrets)?.[0])
    : null
  let _username
  let _password
  if (_groupId) {
    _username = _secrets[_groupId].dbKey
    _password = _secrets[_groupId].dbPassword
  }

  // todo if not authenticated comment out authorization

  const _uri = `https://${process.env.CLOUDANT_HOST}/${path}`
  const _options = {
    ...options,
    headers: {
      ...options.headers,
      ...(_groupId && {
        Authorization: `Basic ${Base64.btoa(`${_username}:${_password}`)}`,
      }),
    },
  }
  return new Promise((resolve, reject) => {
    requestQ.push({ resolve, reject, uri: _uri, options: _options })
  })
}

setInterval(() => {
  if (!requestQ.length) {
    return
  }
  const _req = requestQ.shift()!
  request(_req.uri, _req.options).then(_req.resolve).catch(_req.resolve)
}, 250)

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
