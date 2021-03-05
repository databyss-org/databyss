import React, { useEffect, useCallback, useState } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
// import { debounce } from 'lodash'
import Login from '@databyss-org/ui/modules/Login/Login'
import {
  replicateDbFromRemote,
  syncPouchDb,
  initiatePouchDbIndexes,
} from '@databyss-org/data/pouchdb/db'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import { ResourcePending } from '../interfaces/ResourcePending'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { useServiceContext } from '../'
import { localStorageHasSession } from './clientStorage'
import { CACHE_SESSION, CACHE_PUBLIC_SESSION } from './constants'
import { replicatePage, hasUnathenticatedAccess } from './actions'

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
  const [dbPending, setDbPending] = useState(false)

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
    const _init = async () => {
      const _sesionFromLocalStorage = await localStorageHasSession()

      if (_sesionFromLocalStorage) {
        // 2nd pass: load session from local_storage
        // replicate from cloudant
        const groupId = _sesionFromLocalStorage.defaultGroupId
        await replicateDbFromRemote({
          groupId,
        })

        // TODO: indexing is built after 5 seconds
        setTimeout(() => {
          initiatePouchDbIndexes()
        }, [5000])

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
      } else {
        // if not logged in try to replicate the group database

        // const publicAccount = await isUnauthenticatedSession()
        const unauthenticatedPageId = await hasUnathenticatedAccess()

        if (unauthenticatedPageId) {
          await replicatePage(unauthenticatedPageId)
          dispatch({
            type: CACHE_PUBLIC_SESSION,
            payload: { publicAccount: unauthenticatedPageId },
          })
        } else {
          // pass 1: get session from API
          getSession({ retry: true, code, email })
        }
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

  // TODO: WRAP THIS IN A CALLBACK

  useEffect(() => {
    setDbPending(state.isDbBusy)
    // debounceDbBusy(state.isDbBusy)
  }, [state.isDbBusy])

  const isDbBusy = useCallback(() => dbPending, [dbPending])

  // const isDbBusy = () => dbPending

  const setDefaultPage = useCallback((id) => {
    dispatch(actions.onSetDefaultPage(id))
  }, [])

  return (
    <SessionContext.Provider
      value={{
        ...state,
        isDbBusy,
        setDefaultPage,
        getSession,
        endSession,
        isPublicAccount,
        getCurrentAccount,
        getUserAccount,
        logout,
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
