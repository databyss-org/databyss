import {
  ResourceNotFoundError,
  NotAuthorizedError,
  NetworkUnavailableError,
  InsufficientPermissionError,
  VersionConflictError,
  UnexpectedServerError,
} from '../interfaces'

export const FETCH_TIMEOUT = parseInt(process.env.FETCH_TIMEOUT!, 10)

function checkStatus(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  if (response.status === 401) {
    throw new NotAuthorizedError('Unauthorized')
  }
  if (response.status === 403) {
    throw new InsufficientPermissionError()
  }
  if (response.status === 404) {
    throw new ResourceNotFoundError()
  }
  if (response.status === 409) {
    throw new VersionConflictError()
  }
  throw new UnexpectedServerError(response.statusText, response)
}

function parseResponse(
  responseAsJson?: boolean
): (response: Response) => Promise<any> {
  if (responseAsJson) {
    return (response) => response.json()
  }
  return (response) =>
    response.headers.get('Content-Type')?.match('json')
      ? response.json()
      : response.text()
}

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

  const _timeoutId = setTimeout(() => {
    _controller.abort()
    throw new NetworkUnavailableError(
      `Request timed out after ${_timeoutDuration}ms`
    )
  }, _timeoutDuration)

  return fetch(uri, { ..._options, signal: _controller.signal })
    .catch((err) => {
      throw new NetworkUnavailableError(err)
    })
    .then((response) => {
      clearTimeout(_timeoutId)
      return response
    })
    .then(checkStatus)
    .then((r) => {
      if (rawResponse) {
        return r
      }
      return parseResponse(responseAsJson)(r)
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
