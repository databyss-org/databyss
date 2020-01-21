import {
  CACHE_SESSION,
  DENY_ACCESS,
  REQUEST_CODE,
  END_SESSION,
  FETCH_SESSION,
} from './constants'

import { ResourcePending } from '../lib/ResourcePending'

export const initialState = {
  // session is either `null`, `ResourcePending`, `Error` or {user: {}, account: {}}
  session: new ResourcePending(),
  // in TFA (like email login/register), this is set to true after email is sent
  //   and reset to false on successful authentication and on end session
  requestCode: false,
  // during an auth challenge flow (i.e. not just validating credentials stored
  //   in localStorage but actually prompting the user for credentials), we
  //   put the last challenge response in `lastCredentials` to tell the UI
  //   to keep the challenge module (e.g. <Login />) mounted.
  // cleared when challenge is accepted or rejected
  lastCredentials: null,
}

export default (state, action) => {
  let _credentials = action.payload && action.payload.credentials
  if (_credentials && !Object.keys(_credentials).length) {
    _credentials = null
  }

  switch (action.type) {
    case FETCH_SESSION: {
      const nextState = {
        ...state,
        session: new ResourcePending(),
        lastCredentials: _credentials,
      }
      if (_credentials && !_credentials.code) {
        nextState.requestCode = false
      }
      return nextState
    }
    case REQUEST_CODE: {
      return {
        ...state,
        session: null,
        requestCode: true,
        lastCredentials: _credentials,
      }
    }
    case CACHE_SESSION: {
      return {
        ...state,
        session: action.payload.session,
        requestCode: false,
        lastCredentials: null,
      }
    }
    case DENY_ACCESS: {
      return {
        ...state,
        session: action.payload.error,
        lastCredentials: null,
      }
    }
    case END_SESSION: {
      return {
        ...state,
        session: null,
        lastCredentials: null,
      }
    }

    default:
      return state
  }
}
