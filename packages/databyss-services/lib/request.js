import { deleteAuthToken } from '../auth'
import packageJson from '../package.json'
import { ResourceNotFoundError } from './ResourceNotFoundError'
import { NotAuthorizedError } from './NotAuthorizedError'
import { NetworkUnavailableError } from './NetworkUnavailableError'

export class UnauthorizedError extends Error {}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  if (response.status === 401) {
    deleteAuthToken()
    window.location = '/login'
    throw new UnauthorizedError('Unauthorized')
  }
  if (response.status === 404) {
    throw new ResourceNotFoundError('not found')
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
    response.headers.get('Content-Type').match('json')
      ? response.json()
      : response.text()
}

function request(uri, options, responseIsJson) {
  const promise = fetch(uri, options)
    .then(checkStatus)
    .then(parseResponse(responseIsJson))
    .catch(err => {
      let _err = err
      if (_err.message === "Cannot read property 'token' of null") {
        _err = new NotAuthorizedError('not authorized')
      } else if (_err.message === 'Failed to fetch') {
        _err = new NetworkUnavailableError('not connected')
      }
      return _err
    })
  return promise
}

export function getJson(uri) {
  return request(uri, {}, true)
}

export function addClientVersionQs(uri) {
  return `${uri}?clientVersion=${packageJson.version}`
}

export default request
