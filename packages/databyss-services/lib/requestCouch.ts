import { Base64 } from 'js-base64'
import request, { RequestOptions } from './request'
import {
  ResourceNotFoundError,
  InsufficientPermissionError,
  NotAuthorizedError,
} from '../interfaces'
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
  retryCount: number
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
  if (_groupId && _secrets[_groupId]) {
    _username = _secrets[_groupId].dbKey
    _password = _secrets[_groupId].dbPassword
  }

  // todo if not authenticated comment out authorization

  const _uri = `https://${process.env.CLOUDANT_HOST}/${path}`
  const _options = {
    ...options,
    headers: {
      ...options.headers,
      ...(_username &&
        _password && {
          Authorization: `Basic ${Base64.btoa(`${_username}:${_password}`)}`,
        }),
    },
  }
  return new Promise((resolve, reject) => {
    requestQ.push({
      resolve,
      reject,
      uri: _uri,
      options: _options,
      retryCount: 0,
    })
  })
}

const processQ = () => {
  if (!requestQ.length) {
    // check again soon
    setTimeout(processQ, 250)
    return
  }
  const _req = requestQ.shift()!
  request(_req.uri, _req.options)
    .then((res) => {
      setTimeout(processQ, 250)
      _req.resolve(res)
    })
    .catch((err) => {
      if (
        err instanceof ResourceNotFoundError ||
        err instanceof InsufficientPermissionError ||
        err instanceof NotAuthorizedError
      ) {
        console.log('[requestCouch] processQ error response', err)
        _req.reject(err)
        setTimeout(processQ, 250)
        return
      }
      // we have to assume that we're hitting cloudant's rate limit and getting a 429
      // (assume because the lack of CORS headers in the response means we can't read the status code, see SO link below)
      // https://stackoverflow.com/questions/64341579/why-cant-i-access-the-response-eg-to-check-response-code-when-i-get-a-429-wi
      // put it back on the Q and try again later
      _req.retryCount += 1
      if (_req.retryCount > 20) {
        setTimeout(processQ, 250)
        _req.reject(err)
      } else {
        requestQ.unshift(_req)
        setTimeout(processQ, 250 * _req.retryCount)
      }
    })
}

processQ()

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
