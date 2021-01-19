import {
  syncPouchDb,
  replicateDbFromRemote,
  initiatePouchDbValidators,
  initiatePouchDbIndexes,
} from '@databyss-org/data/pouchdb/db'
import { addPage } from '@databyss-org/data/pouchdb/pages/util'
import request from '../lib/request'
import { httpPost } from '../lib/requestApi'
import { NotAuthorizedError } from '../interfaces'
import { version as databyssVersion } from '../package.json'
import {
  FETCH_SESSION,
  CACHE_SESSION,
  DENY_ACCESS,
  REQUEST_CODE,
  END_SESSION,
  CACHE_PUBLIC_SESSION,
  GET_USER_ACCOUNT,
  CACHE_USER_ACCOUNT,
  LOGOUT,
  SET_DEFAULT_PAGE,
  SET_SESSION,
} from './constants'
import {
  getAuthToken,
  getAccountId,
  deletePouchDbs,
  setDefaultPageId,
  deleteUserPreferences,
  setUserSession,
  setDbPassword,
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
    const authToken = await getAuthToken()
    const accountId = await getAccountId()

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

    const res = await _request(path, options, true)

    if (res.data && res.data.session) {
      // authenticated

      const { session } = res.data

      const _defaultPageId = session.user.groups.find(
        (g) => g.groupId === session.user.defaultGroupId
      ).defaultPageId

      const _userSession = {
        provisionClientDatabase: session.user.provisionClientDatabase,
        replicateClientDatabase: session.user.replicateClientDatabase,
        token: session.token,
        userId: session.user._id,
        email: session.user.email,
        defaultPageId: _defaultPageId,
        defaultGroupId: session.user.defaultGroupId,
        // remove password
        groups: session.user.groups.map((g) => ({
          dbKey: g.dbKey,
          defaultPageId: g.defaultPageId,
          groupId: g.groupId,
          role: g.role,
        })),
      }

      // save passwords in localstorage
      setDbPassword(session.user.groups)

      // save session in pouchdb
      await setUserSession(_userSession)

      // initiate database validators
      initiatePouchDbValidators()
      // initiate database indexes
      await initiatePouchDbIndexes()

      // initialize a new user
      if (_userSession.provisionClientDatabase) {
        // initate new database
        await addPage(_defaultPageId)
      }

      /*
      if logging into an existing account, wait for database replication to complete before continuing
      */
      if (_userSession.replicateClientDatabase) {
        await replicateDbFromRemote({
          ...res.data.session.user.groups[0],
          groupId: res.data.session.user.defaultGroupId,
        })
      }

      // sync database
      syncPouchDb({
        ...res.data.session.user.groups[0],
        groupId: res.data.session.user.defaultGroupId,
      })

      dispatch({
        type: CACHE_SESSION,
        payload: {
          session: _userSession,
        },
      })
    } else if (res.data?.isPublic) {
      // cache public account info in session state
      dispatch({
        type: CACHE_PUBLIC_SESSION,
        payload: { publicAccount: res.data.accountId },
      })
    } else {
      // assume TFA, request code
      dispatch({
        type: REQUEST_CODE,
        payload: { email },
      })
    }
  } catch (error) {
    await deleteUserPreferences()
    dispatch({
      type: DENY_ACCESS,
      payload: { error },
    })
    if (!(error instanceof NotAuthorizedError)) {
      throw error
    }
  }
}

export const endSession = () => async (dispatch) => {
  await deletePouchDbs()
  dispatch({
    type: END_SESSION,
  })
}

export const getUserAccount = () => async (dispatch) => {
  dispatch({ type: GET_USER_ACCOUNT })
  const authToken = await getAuthToken()
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
  await deletePouchDbs()

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
