import React, { createContext, useContext, useEffect } from 'react'
import Login from '@databyss-org/ui/modules/Login/Login'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import { ResourcePending } from '../lib/ResourcePending'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { useServiceContext } from '../'

const useReducer = createReducer()

export const SessionContext = createContext()

const SessionProvider = ({ children, initialState, signUp }) => {
  const [state, dispatch] = useReducer(reducer, initialState, {
    name: 'SessionProvider',
  })
  const { session: actions } = useServiceContext()

  // credentials can be:
  // - `undefined` if we're just reloading
  // - `code` if we're logging in from an email link or code
  // - `email` if we're registering a new user (TFA, will request code)
  // - `googleToken` if we're logging in with Google oAuth
  const getSession = ({ retry, ...credentials } = {}) => {
    if (state.session && !retry) {
      return state.session
    }
    if (state.session instanceof ResourcePending && !retry) {
      return state.session
    }
    // else fetch
    dispatch(actions.fetchSession(credentials))
    return null
  }

  const endSession = () => dispatch(actions.endSession())

  // try to resume session on mount
  useEffect(() => {
    getSession({ retry: true })
  }, [])

  let _children = children
  const isPending = state.session instanceof ResourcePending
  if (
    !state.session ||
    state.session instanceof Error ||
    state.lastCredentials
  ) {
    _children = <Login pending={isPending} signupFlow={signUp} />
  } else if (isPending) {
    _children = <Loading />
  }

  return (
    <SessionContext.Provider value={{ ...state, getSession, endSession }}>
      {_children}
    </SessionContext.Provider>
  )
}

export const useSessionContext = () => useContext(SessionContext)

SessionProvider.defaultProps = {
  initialState,
  signUp: false,
}

export default SessionProvider
