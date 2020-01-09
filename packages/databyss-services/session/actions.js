import request from '../lib/request'

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

export const fetchSession = async ({
  code,
  googleToken,
  email,
}) => async dispatch => {
  dispatch({ type: FETCH_SESSION })

  // fetch params
  let path = process.env.REACT_APP_API_URL
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const authToken = getAuthToken()
  const accountId = getAccountId()
  if (authToken && accountId) {
    // if we have the token, try to use it
    path += '/auth'
    request.headers['x-databyss-account'] = accountId
    request.headers['x-auth-token'] = authToken
  } else if (googleToken) {
    // google oAuth token
    path = `/users/google`
    request.body = JSON.stringify({ token: googleToken })
  } else if (code) {
    // code from email
    path += '/auth/code'
    request.body = JSON.stringify({ code })
  } else if (email) {
    // register with email
    path = `/users/email`
    request.body = JSON.stringify({ email })
  } else {
    dispatch({
      type: DENY_ACCESS,
      payload: { error: new Error('No credentials') },
    })
  }

  try {
    const res = await request(path, options, true)
    if (res.data.session) {
      // authenticated
      setAuthToken(res.data.token)
      setAccountId(res.data.accountId)
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
      })
    }
  } catch (error) {
    deleteAuthToken()
    deleteAccountId()
    dispatch({
      type: DENY_ACCESS,
      payload: { error },
    })
  }
}

export const endSession = () => {
  deleteAuthToken()
  deleteAccountId()

  return {
    type: END_SESSION,
  }
}
