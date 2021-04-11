import React, { useEffect, useCallback } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
// import { debounce } from 'lodash'
import Login from '@databyss-org/ui/modules/Login/Login'
import {
  replicateDbFromRemote,
  syncPouchDb,
  initiatePouchDbIndexes,
} from '@databyss-org/data/pouchdb/db'
// import { connect } from '@databyss-org/data/couchdb-client/couchdb'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { ResourcePending } from '../interfaces/ResourcePending'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { useServiceContext } from '../'
import {
  localStorageHasSession,
  localStorageHasPublicSession,
} from './clientStorage'
import { CACHE_SESSION, CACHE_PUBLIC_SESSION } from './constants'
import { replicateGroup, hasUnathenticatedAccess } from './actions'
import { NetworkUnavailableError } from '../interfaces'

const useReducer = createReducer()

export const SessionContext = createContext()

// @signUp (bool)
//   if true, show signup UI
// @code
//   login code from email flow (from url, for example)
// @unauthorizedChildren
//   Children to render when session is null or pending
//   Should pass `pending` and `signupFlow` to Login component
const SessionProvider = ({
  children,
  initialState,
  signUp,
  code,
  email,
  unauthorizedChildren,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState, {
    name: 'SessionProvider',
  })
  const { session: actions } = useServiceContext()
  const { notify } = useNotifyContext()

  const isPublicAccount = useCallback(() => {
    if (state.session.publicAccount?._id) {
      return true
    }
    return false
  }, [state.session?.publicAccount])

  const getUserAccount = useCallback(() => {
    if (state.userInfo) {
      return state.userInfo
    }
    dispatch(actions.getUserAccount())
    return null
  }, [state.userInfo])

  const getCurrentAccount = useCallback(() => {
    if (state.session.publicAccount?._id) {
      return state.session.publicAccount._id
    }
    return state.session.account._id
  }, [state.session])
  // credentials can be:
  // - `undefined` if we're just reloading
  // - `code` if we're logging in from an email link or code
  // - `email` if we're registering a new user (TFA, will request code)
  // - `googleToken` if we're logging in with Google oAuth
  const getSession = useCallback(
    ({ retry, ...credentials } = {}) => {
      if (state.session && !retry) {
        return state.session
      }
      if (state.session instanceof ResourcePending && !retry) {
        return state.session
      }
      // else fetch
      dispatch(actions.fetchSession(credentials))
      return null
    },
    [state.session]
  )

  const endSession = () => dispatch(actions.endSession())

  useEffect(() => {
    if (state.session instanceof NetworkUnavailableError) {
      notify({
        message:
          "We're having trouble reaching the server. Please check your network and try again.",
      })
    }
  }, [state.session])

  useEffect(() => {
    const _init = async () => {
      const _sesionFromLocalStorage = await localStorageHasSession()

      if (_sesionFromLocalStorage) {
        // 2nd pass: load session from local_storage
        // replicate from cloudant
        const groupId = _sesionFromLocalStorage.defaultGroupId
        // download remote database if not on mobile

        if (!process.env.FORCE_MOBILE) {
          await replicateDbFromRemote({
            groupId,
          })

          // set up search indexes
          setTimeout(() => {
            initiatePouchDbIndexes()
          }, [5000])
        }

        // set up live sync
        syncPouchDb({
          groupId,
          // TODO: how to curry dispatch
          dispatch,
        })

        dispatch({
          type: CACHE_SESSION,
          payload: {
            session: _sesionFromLocalStorage,
          },
        })
        return
      }

      // do we have a public group in localstorage
      let _publicSession = await localStorageHasPublicSession()
      if (_publicSession) {
        // start replication on public group
        await replicateGroup(_publicSession.belongsToGroup)
      } else {
        // try to get public access
        const unauthenticatedGroupId = await hasUnathenticatedAccess()
        if (unauthenticatedGroupId) {
          await replicateGroup(unauthenticatedGroupId)
          _publicSession = await localStorageHasPublicSession()
        }
      }
      if (_publicSession) {
        dispatch({
          type: CACHE_PUBLIC_SESSION,
          payload: {
            session: {
              defaultPageId: _publicSession.defaultPageId,
              defaultGroupId: _publicSession._id,
              publicAccount: {
                _id: _publicSession._id,
              },
              notifications: _publicSession.notifications ?? [],
            },
          },
        })
      } else {
        // pass 1: get session from API
        getSession({ retry: true, code, email })
      }
    }

    if (!state.sesson) {
      _init()
    }
  }, [state.sessionIsStored])

  // // try to resume session on mount
  // useEffect(() => {
  //   getSession({ retry: true, code, email })
  // }, [])

  let _children = children
  const isPending = state.session instanceof ResourcePending
  if (
    !state.session ||
    state.session instanceof Error ||
    state.lastCredentials
  ) {
    _children = React.cloneElement(unauthorizedChildren, {
      pending: isPending,
      signupFlow: signUp,
    })
  } else if (isPending) {
    _children = <Loading />
  }

  const logout = () => {
    dispatch(actions.logout())
  }

  const setDefaultPage = useCallback((id) => {
    dispatch(actions.onSetDefaultPage(id))
  }, [])

  return (
    <SessionContext.Provider
      value={{
        ...state,
        setDefaultPage,
        getSession,
        endSession,
        isPublicAccount,
        getCurrentAccount,
        getUserAccount,
        logout,
        dispatch,
      }}
    >
      {_children}
    </SessionContext.Provider>
  )
}

export const useSessionContext = (selector = (x) => x) =>
  useContextSelector(SessionContext, selector)

// useContext(SessionContext)

SessionProvider.defaultProps = {
  initialState,
  signUp: false,
  unauthorizedChildren: <Login />,
}

export default SessionProvider
