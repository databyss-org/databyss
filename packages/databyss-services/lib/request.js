import packageJson from '../package.json'
import {
  ResourceNotFoundError,
  NotAuthorizedError,
  NetworkUnavailableError,
} from './errors'

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  if (response.status === 401) {
    throw new NotAuthorizedError('Unauthorized')
  }
  if (response.status === 404) {
    throw new ResourceNotFoundError()
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
    .catch(err => {
      throw new NetworkUnavailableError(err)
    })
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
