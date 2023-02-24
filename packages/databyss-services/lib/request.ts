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

  return new Promise<any>((resolve, reject) => {
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
          resolve(response)
        }
        if (
          responseAsJson ||
          response.headers.get('Content-Type')?.match('json')
        ) {
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
    const _res = await request(process.env.API_URL, {
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
