import React, { useEffect, useCallback, useRef } from 'react'
import _ from 'lodash'
import { createContext, useContextSelector } from 'use-context-selector'
import { db } from '@databyss-org/data/pouchdb/db'
import Login from '@databyss-org/ui/modules/Login/Login'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import { ResourcePending } from '../interfaces/ResourcePending'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { useServiceContext } from '../'

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
  unauthorizedChildren,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState, {
    name: 'SessionProvider',
  })
  const { session: actions } = useServiceContext()

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

  // try to resume session on mount
  useEffect(() => {
    getSession({ retry: true, code })
  }, [])

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

  // keep track of user preferences, if changes are made, send to api
  const userSession = useRef()

  useEffect(() => {
    db.changes({
      since: 'now',
      live: true,
      include_docs: true,
    }).on('change', (changes) => {
      if (
        changes.id === 'user_preferences' &&
        !_.isEqual(userSession.current, changes.doc)
      ) {
        userSession.current = changes.doc
        dispatch(actions.setSession(changes.doc))
      }
    })
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
