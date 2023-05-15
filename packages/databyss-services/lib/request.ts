import {
  ResourceNotFoundError,
  NotAuthorizedError,
  NetworkUnavailableError,
  InsufficientPermissionError,
  VersionConflictError,
  UnexpectedServerError,
} from '../interfaces'
import { sleep } from './util'

export const FETCH_TIMEOUT = parseInt(process.env.FETCH_TIMEOUT!, 10)

// eslint-disable-next-line no-undef
export interface RequestOptions extends RequestInit {
  /**
   * Force response parsing to JSON.
   * If false, only parse as JSON if the Content-Type header is "json"
   */
  responseAsJson?: boolean
  /**
   * Number of MS to wait for a response from the server before timing out
   */
  timeout?: number
  /**
   * Return the raw response, no parse
   */
  rawResponse?: boolean
}

function request<T>(uri, options: RequestOptions = {}) {
  const { timeout, responseAsJson, rawResponse, ..._options } = options
  const _controller = new AbortController()
  const _timeoutDuration = timeout || FETCH_TIMEOUT

  return new Promise<T>((resolve, reject) => {
    const _timeoutId = setTimeout(() => {
      _controller.abort()
      console.log(`[request] Request timed out after ${_timeoutDuration}ms`)
      reject(
        new NetworkUnavailableError(
          `Request timed out after ${_timeoutDuration}ms`
        )
      )
    }, _timeoutDuration)
    fetch(uri, { ..._options, signal: _controller.signal })
      .catch((err) => {
        reject(new NetworkUnavailableError(err))
      })
      .then((response) => {
        clearTimeout(_timeoutId)
        if (!response) {
          reject(new NetworkUnavailableError('Response is null'))
          return null
        }
        checkResponse({
          status: response.status,
          statusText: response.statusText,
          response,
          reject,
        })
        return response
      })
      .then((response) => {
        if (!response) {
          return
        }
        if (rawResponse) {
          resolve((response as unknown) as T)
          return
        }
        if (
          responseAsJson ||
          response.headers.get('Content-Type')?.match('json')
        ) {
          response
            .json()
            .then((json) => resolve(json as T))
            .catch(reject)
          return
        }
        response!
          .text()
          .then((txt) => resolve((txt as unknown) as T))
          .catch(reject)
      })
  })
}

export function waitForNetwork({
  pollTimer = 1000,
  maxAttempts = 10,
}: {
  pollTimer?: number
  maxAttempts?: number
} = {}) {
  if (process.env.NODE_ENV === 'test') {
    return new Promise((resolve) => resolve(true))
  }
  return waitForUrl({ url: process.env.API_URL!, pollTimer, maxAttempts })
}

export function checkNetwork() {
  if (process.env.NODE_ENV === 'test') {
    return new Promise((resolve) => resolve(true))
  }
  return checkUrl(`https://${process.env.DRIVE_HOST!}`)
}

/**
 * Returns true only if HEAD request for URL returns 200
 */
export async function checkUrl(url: string) {
  try {
    const _res = await request<Response>(url, {
      method: 'HEAD',
      rawResponse: true,
    })
    if (!(_res && (_res.ok || _res.type === 'opaque'))) {
      return false
    }
  } catch (err) {
    return false
  }
  return true
}

export async function waitForUrl({
  url,
  pollTimer = 1000,
  maxAttempts = 10,
}: {
  url: string
  pollTimer?: number
  maxAttempts?: number
}) {
  let tries = 1
  while (!(await checkUrl(url))) {
    tries += 1
    if (tries > maxAttempts) {
      return false
    }
    await sleep(pollTimer)
  }
  return true
}

export function getJson(uri) {
  return request(uri, { responseAsJson: true })
}

export default request

export function checkResponse({
  status,
  statusText,
  response,
  reject,
}: {
  status: number
  statusText?: string
  response?: Response
  reject: (reason?: any) => void
}) {
  if (status >= 200 && status < 300) {
    return true
  }
  if (status === 401) {
    reject(new NotAuthorizedError('Unauthorized'))
  }
  if (status === 403) {
    reject(new InsufficientPermissionError())
  }
  if (status === 404) {
    reject(new ResourceNotFoundError())
  }
  if (status === 409) {
    reject(new VersionConflictError())
  }
  reject(new UnexpectedServerError(statusText, response))
  return false
}
