import packageJson from '../package.json'
import {
  ResourceNotFoundError,
  NotAuthorizedError,
  NetworkUnavailableError,
  InsufficientPermissionError,
  VersionConflict,
} from '../interfaces'

const FETCH_TIMEOUT = process.env.FETCH_TIMEOUT

function checkStatus(response) {
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
    throw new VersionConflict()
  }
  const errorMessage = response.statusText
  const error = new Error(errorMessage)
  console.error(error)
  error.info = response
  throw error
}

function parseResponse(responseIsJson) {
  if (responseIsJson) {
    return response => response.json()
  }
  return response =>
    response.headers.get('Content-Type')?.match('json')
      ? response.json()
      : response.text()
}

function request(uri, options = {}, responseIsJson) {
  const { timeout, ..._options } = options
  const _controller = new AbortController()
  const _timeoutDuration = timeout || FETCH_TIMEOUT
  const _timeoutId = setTimeout(() => {
    _controller.abort()
    throw new NetworkUnavailableError(
      `Request timed out after ${_timeoutDuration}ms`
    )
  }, _timeoutDuration)

  return fetch(uri, { ..._options, signal: _controller.signal })
    .catch(err => {
      throw new NetworkUnavailableError(err)
    })
    .then(response => {
      clearTimeout(_timeoutId)
      return response
    })
    .then(checkStatus)
    .then(parseResponse(responseIsJson))
}

export function getJson(uri) {
  return request(uri, {}, true)
}

export function addClientVersionQs(uri) {
  return `${uri}?clientVersion=${packageJson.version}`
}

export default request
