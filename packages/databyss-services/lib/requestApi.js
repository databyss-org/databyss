import request from './request'
import { getAuthToken } from './auth'

export const requestApi = (path, options = { headers: {} }, responseIsJson) =>
  request(
    process.env.REACT_APP_API_URL + path,
    {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${getAuthToken()}`,
      },
    },
    responseIsJson
  )

export const httpGet = path => requestApi(path)

export const httpPost = (path, body) =>
  requestApi(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpPut = (path, body) =>
  requestApi(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export const httpDelete = (path, body) =>
  requestApi(path, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

export default httpGet
