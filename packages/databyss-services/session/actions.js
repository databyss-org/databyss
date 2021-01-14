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
  // SET_DEFAULT_PAGE,
} from './constants'
import {
  setAuthToken,
  getAuthToken,
  deleteAuthToken,
  getAccountId,
  setAccountId,
  // getDefaultPageId,
  deleteAccountId,
  // setDefaultPageId,
  setCredentials,
  deleteCredentials,
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
    const accountId = getAccountId()

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
      setAuthToken(res.data.session.token)
      setAccountId(res.data.session.user.defaultGroupId)
      setCredentials(res.data.session.user.groups[0])

      // initiate database validators
      initiatePouchDbValidators()
      // initiate database indexes
      await initiatePouchDbIndexes()

      // initialize a new user
      if (res.data.session.user.provisionClientDatabase) {
        // initate new database
        // await initiateClientDb(res.data.session.user.defaultPageId)
        await addPage(res.data.session.user.defaultPageId)
      }

      /*
      if logging into an existing account, wait for database replication to complete before continuing
      */
      if (res.data.session.user.replicateClientDatabase) {
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
          session: res.data.session,
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

export const getUserAccount = () => async (dispatch) => {
  dispatch({ type: GET_USER_ACCOUNT })
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
  deleteAuthToken()
  deleteAccountId()
  deleteCredentials()

  // deletes databases
  let dbs = await window.indexedDB.databases()
  dbs = dbs.filter((db) => db.name.includes('_pouch_'))

  await Promise.all(
    dbs.map(
      (db) =>
        new Promise((resolve, reject) => {
          const request = indexedDB.deleteDatabase(db.name)
          request.onsuccess = resolve
          request.onerror = reject
        })
    )
  )

  dispatch({ type: LOGOUT })
  setTimeout(() => (window.location.href = '/'), 50)
}

export const onSetDefaultPage = (id) =>
  // async (dispatch) =>
  {
    console.log('SET DEFAULT PAGE', id)
    // TODO: THIS ONLY SETS THE DEFAULT PAGE LOCALLY. PAGE NEEDS TO BE CHANGED ON CLOUDANT AS WELL
    // default page will always be the same since it is recieveing it from the server
    // setDefaultPageId(id)
    // httpPost(`/accounts/page/${id}`).then(() => {
    //   dispatch({
    //     type: SET_DEFAULT_PAGE,
    //     payload: { id },
    //   })
    // })
  }
