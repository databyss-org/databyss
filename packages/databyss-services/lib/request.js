import { deleteAuthToken } from '../auth'
import packageJson from '../package.json'

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

  return promise
}

export function getJson(uri) {
  return request(uri, {}, true)
}

export function addClientVersionQs(uri) {
  return `${uri}?clientVersion=${packageJson.version}`
}

export default request
