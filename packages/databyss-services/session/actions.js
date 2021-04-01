import {
  replicateDbFromRemote,
  replicatePublicGroup,
  REMOTE_CLOUDANT_URL,
} from '@databyss-org/data/pouchdb/db'
import request from '../lib/request'
import { httpPost } from '../lib/requestApi'
import { NetworkUnavailableError, NotAuthorizedError } from '../interfaces'
import { version as databyssVersion } from '../package.json'
import {
  FETCH_SESSION,
  DENY_ACCESS,
  REQUEST_CODE,
  END_SESSION,
  GET_USER_ACCOUNT,
  CACHE_USER_ACCOUNT,
  LOGOUT,
  SET_DEFAULT_PAGE,
  SET_SESSION,
  STORE_SESSION_LOCALLY,
} from './constants'
import {
  getAuthToken,
  cleanupDefaultGroup,
  setDefaultPageId,
  setAuthToken,
  setPouchSecret,
  getUserId,
  localStorageHasSession,
} from './clientStorage'

import { getAccountFromLocation } from './_helpers'

export const fetchSession = ({ _request, ...credentials }) => async (
  dispatch
) => {
  // eslint-disable-next-line no-param-reassign
  _request = _request || request

  const { code, googleCode, email } = credentials

  dispatch({ type: FETCH_SESSION, payload: { credentials } })
  // fetch params
  let path = process.env.API_URL
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-databyss-version': databyssVersion,
    },
  }

  try {
    const authToken = getAuthToken()
    const accountId = await getUserId()

    if (authToken && accountId) {
      // if not at at root path '/' and accountID is not the same as the one in the url, set as guest account
      if (
        // This had to be added for the pouchDB refactor, not sure why this had to be changed?
        !process.env.STORYBOOK &&
        getAccountFromLocation() &&
        (accountId !== getAccountFromLocation() ||
          !window.location.pathname === '/')
      ) {
        // get account from url
        const _accountId = getAccountFromLocation()
        path += '/auth'
        options.headers['x-databyss-as-account'] = _accountId
      } else {
        // if we have the token, try to use it
        path += '/auth'
        options.headers['x-databyss-account'] = accountId
        options.headers['x-auth-token'] = authToken
      }
    } else if (googleCode) {
      // google oAuth token
      path += '/users/google'
      options.body = JSON.stringify({ code: googleCode })
      if (process.env.FORCE_MOBILE) {
        options.headers['x-databyss-mobile'] = true
      }
    } else if (code && email) {
      // code from email
      path += '/auth/code'
      options.body = JSON.stringify({ code, email })
    } else if (email) {
      // register with email
      path += '/users/email'
      options.body = JSON.stringify({ email })
    } else {
      // get account from url
      const _accountId = getAccountFromLocation()
      path += '/auth'
      if (_accountId) {
        options.headers['x-databyss-as-account'] = _accountId
      }
    }

    const res = await _request(path, {
      ...options,
      responseAsJson: true,
      timeout: 15000,
    })
    if (res.data && res.data.session) {
      const { session } = res.data

      // set credentials in local storage if sent from server
      if (session.groupCredentials) {
        setPouchSecret(session.groupCredentials)
      }

      // set token in local storage
      setAuthToken(session.token)

      // replicate database from cloudant
      // assume its the first ID provided in credentials
      const _defaultGroupId =
        session.user?.defaultGroupId || session?.groupCredentials[0].groupId

      await replicateDbFromRemote({
        groupId: _defaultGroupId,
      })

      dispatch({
        type: STORE_SESSION_LOCALLY,
      })
    } else if (res.data?.isPublic) {
      throw new Error('We should never get here')
      // cache public account info in session state
      // dispatch({
      //   type: CACHE_PUBLIC_SESSION,
      //   payload: { publicAccount: res.data.accountId },
      // })
    } else {
      // assume TFA, request code
      dispatch({
        type: REQUEST_CODE,
        payload: { email },
      })
    }
  } catch (error) {
    try {
      await cleanupDefaultGroup()
    } catch (err) {
      console.error(err)
    }
    dispatch({
      type: DENY_ACCESS,
      payload: { error },
    })
    if (
      !(error instanceof NotAuthorizedError) &&
      !(error instanceof NetworkUnavailableError)
    ) {
      throw error
    }
  }
}

export const endSession = () => async (dispatch) => {
  await cleanupDefaultGroup()
  dispatch({
    type: END_SESSION,
  })
}

export const getUserAccount = () => async (dispatch) => {
  dispatch({ type: GET_USER_ACCOUNT })
  const _sesionFromLocalStorage = await localStorageHasSession()
  if (_sesionFromLocalStorage) {
    dispatch({
      type: CACHE_USER_ACCOUNT,
      payload: { data: _sesionFromLocalStorage },
    })
    return
  }
  const authToken = getAuthToken()
  if (authToken) {
    const data = { authToken }
    const _res = await httpPost('/users', { data })
    dispatch({ type: CACHE_USER_ACCOUNT, payload: _res })
  } else {
    dispatch({ type: CACHE_USER_ACCOUNT, payload: null })
  }
}

export const logout = () => async (dispatch) => {
  // deletes databases
  await cleanupDefaultGroup()

  dispatch({ type: LOGOUT })
  setTimeout(() => (window.location.href = '/'), 50)
}

export const onSetDefaultPage = (id) => async (dispatch) => {
  await setDefaultPageId(id)

  dispatch({
    type: SET_DEFAULT_PAGE,
    payload: { id },
  })
}

export const setSession = (session) => async (dispatch) => {
  await httpPost(`/cloudant/user`, { data: { session } })
  dispatch({
    type: SET_SESSION,
    payload: { session },
  })
}

/*
checks url for public page
*/
export const isPagePublic = async () => {
  const path = window.location.pathname.split('/')
  // get the page id
  const pageId = path?.[3]
  if (pageId) {
    const groupId = `p_${pageId}`
    try {
      await request(`${REMOTE_CLOUDANT_URL}/${groupId}`)
      return groupId
    } catch (err) {
      return false
    }
  }
  return false
}

export const isGroupPublic = async () => {
  const path = window.location.pathname.split('/')
  // get the page id
  const groupId = path?.[1]
  if (groupId) {
    const group = `g_${groupId}`
    try {
      await request(`${REMOTE_CLOUDANT_URL}/${group}`)
      return group
    } catch (err) {
      return false
    }
  }
  return false
}

export const hasUnathenticatedAccess = async () => {
  const _isGroupPublic = await isGroupPublic()
  if (_isGroupPublic) {
    return _isGroupPublic
  }

  const _isPagePublic = await isPagePublic()
  if (_isPagePublic) {
    return _isPagePublic
  }

  return false
}

export const replicateGroup = async (id) => {
  // attempt group replication
  await replicatePublicGroup({
    groupId: id,
  })
}
