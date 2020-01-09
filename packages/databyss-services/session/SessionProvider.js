import React, { createContext, useContext } from 'react'
import Login from '@databyss-org/ui/modules/Login/Login'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import { useServiceContext } from '../'

const useReducer = createReducer()

export const SessionContext = createContext()

const SessionProvider = ({ children, initialState }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { session: actions } = useServiceContext()

  // credentials can be:
  // - `undefined` if we're just reloading
  // - `code` if we're logging in from an email link or code
  // - `email` if we're registering a new user (TFA, will request code)
  // - `googleToken` if we're logging in with Google oAuth
  const getSession = credentials => {
    if (state.session) {
      return state.session
    }
    // else fetch
    dispatch(actions.fetchSession(credentials))
    return null
  }

  const endSession = () => {
    dispatch(actions.endSession())
  }

  return (
    <SessionContext.Provider value={{ ...state, getSession, endSession }}>
      {state.session && !(state.session instanceof Error) ? (
        children
      ) : (
        <Login />
      )}
    </SessionContext.Provider>
  )
}

export const useSessionContext = () => useContext(SessionContext)

SessionProvider.defaultProps = {
  initialState,
}

export default SessionProvider
