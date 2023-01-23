import {
  ResourceNotFoundError,
  NotAuthorizedError,
  NetworkUnavailableError,
  InsufficientPermissionError,
  VersionConflictError,
  UnexpectedServerError,
} from '../interfaces'

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

function request(uri, options: RequestOptions = {}) {
  const { timeout, responseAsJson, rawResponse, ..._options } = options
  const _controller = new AbortController()
  const _timeoutDuration = timeout || FETCH_TIMEOUT

  return new Promise<Response | string>((resolve, reject) => {
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
        if (response.status >= 200 && response.status < 300) {
          return response
        }
        if (response.status === 401) {
          reject(new NotAuthorizedError('Unauthorized'))
        }
        if (response.status === 403) {
          reject(new InsufficientPermissionError())
        }
        if (response.status === 404) {
          reject(new ResourceNotFoundError())
        }
        if (response.status === 409) {
          reject(new VersionConflictError())
        }
        reject(new UnexpectedServerError(response.statusText, response))
        return response
      })
      .then((response) => {
        if (!response) {
          return
        }
        if (rawResponse) {
          resolve(response)
        }
        if (responseAsJson) {
          response.json().then(resolve).catch(reject)
          return
        }
        if (response.headers.get('Content-Type')?.match('json')) {
          response.json().then(resolve).catch(reject)
          return
        }
        response!.text().then(resolve).catch(reject)
      })
  })
}

export async function checkNetwork() {
  if (process.env.NODE_ENV === 'test') {
    return true
  }
  try {
    const _res = (await request(process.env.API_URL, {
      method: 'HEAD',
      rawResponse: true,
    })) as Response
    if (!(_res && (_res.ok || _res.type === 'opaque'))) {
      return false
    }
  } catch (err) {
    return false
  }
  return true
}

export function getJson(uri) {
  return request(uri, { responseAsJson: true })
}

export default request
