import request from '../lib/request'
import { NotAuthorizedError } from '../lib/errors'

import {
  FETCH_SESSION,
  CACHE_SESSION,
  DENY_ACCESS,
  REQUEST_CODE,
  END_SESSION,
} from './constants'

import {
  setAuthToken,
  getAuthToken,
  deleteAuthToken,
  getAccountId,
  setAccountId,
  deleteAccountId,
} from './clientStorage'

export const fetchSession = ({
  _request,
  ...credentials
}) => async dispatch => {
  // eslint-disable-next-line no-param-reassign
  _request = _request || request

  const { code, googleToken, email } = credentials

  dispatch({ type: FETCH_SESSION, payload: { credentials } })

  // fetch params
  let path = process.env.API_URL
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    const authToken = getAuthToken()
    const accountId = getAccountId()
    if (authToken && accountId) {
      // if we have the token, try to use it
      path += '/auth'
      options.headers['x-databyss-account'] = accountId
      options.headers['x-auth-token'] = authToken
    } else if (googleToken) {
      // google oAuth token
      path += '/users/google'
      options.body = JSON.stringify({ token: googleToken })
    } else if (code) {
      // code from email
      path += '/auth/code'
      options.body = JSON.stringify({ code })
    } else if (email) {
      // register with email
      path += '/users/email'
      options.body = JSON.stringify({ email })
    } else {
      throw new NotAuthorizedError()
    }

    const res = await _request(path, options, true)
    if (res.data && res.data.session) {
      // authenticated
      setAuthToken(res.data.session.token)
      setAccountId(res.data.session.account._id)
      dispatch({
        type: CACHE_SESSION,
        payload: {
          session: res.data.session,
        },
      })
    } else {
      // assume TFA, request code
      dispatch({
        type: REQUEST_CODE,
        payload: { email },
      })
    }
  } catch (error) {
    deleteAuthToken()
    deleteAccountId()
    dispatch({
      type: DENY_ACCESS,
      payload: { error },
    })
    if (!(error instanceof NotAuthorizedError)) {
      throw error
    }
  }
}

export const endSession = () => {
  deleteAuthToken()
  deleteAccountId()

  return {
    type: END_SESSION,
  }
}
