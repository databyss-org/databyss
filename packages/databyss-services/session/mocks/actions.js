import * as actions from '../actions'
import request from './request'

export const fetchSession = args => actions.fetchSession({ ...args, request })
export const endSession = actions.endSession

/*
import {
  FETCH_SESSION,
  CACHE_SESSION,
  DENY_ACCESS,
  REQUEST_CODE,
  END_SESSION,
} from '../constants'

import {
  setAuthToken,
  getAuthToken,
  deleteAuthToken,
  getAccountId,
  setAccountId,
  deleteAccountId,
} from '../clientStorage'

import { mockSession1, validAuthToken, validCode } from './sessions'

export const fetchSession = async ({
  code,
  googleToken,
  email,
}) => async dispatch => {
  dispatch({ type: FETCH_SESSION })

  const authToken = getAuthToken()
  const accountId = getAccountId()

  let sessionData = null

  try {
    if (authToken && accountId) {
      // check local creds
      if (authToken === validAuthToken) {
        sessionData = mockSession1
      }
    } else if (googleToken) {
      // assume valid google token
      sessionData = mockSession1
    } else if (code) {
      // check code from email
      if (code === validCode) {
        sessionData = mockSession1
      }
    } else if (email) {
      // register with email
    } else {
      throw new Error('No credentials')
    }

    if (sessionData) {
      // authenticated
      setAuthToken(res.data.token)
      setAccountId(res.data.account.id)
      dispatch({
        type: CACHE_SESSION,
        payload: {
          session: sessionData,
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
*/
