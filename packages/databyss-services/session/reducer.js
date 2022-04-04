import {
  CACHE_SESSION,
  DENY_ACCESS,
  REQUEST_CODE,
  END_SESSION,
  FETCH_SESSION,
  CACHE_PUBLIC_SESSION,
  GET_USER_ACCOUNT,
  CACHE_USER_ACCOUNT,
  SET_DEFAULT_PAGE,
  STORE_SESSION_LOCALLY,
  SET_READ_ONLY,
} from './constants'

import { ResourcePending } from '../interfaces/'

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
  userInfo: null,
  // monitors pouch db sync
  isDbBusy: false,
  readsPending: 0,
  writesPending: 0,
  sessionIsStored: false,
  isReadOnly: true,
}

export default (state, action) => {
  let _credentials = action.payload && action.payload.credentials
  // remove null credentials
  if (_credentials) {
    _credentials = Object.keys(_credentials).reduce((accum, key) => {
      if (_credentials[key]) {
        accum[key] = _credentials[key]
      }
      return accum
    }, {})
    // if object is empty, credentials is null
    if (!Object.keys(_credentials).length) {
      _credentials = null
    }
  }

  switch (action.type) {
    case CACHE_USER_ACCOUNT: {
      return {
        ...state,
        userInfo: action.payload.data,
      }
    }
    case STORE_SESSION_LOCALLY: {
      return {
        ...state,
        sessionIsStored: true,
      }
    }
    case GET_USER_ACCOUNT: {
      return {
        ...state,
        userInfo: new ResourcePending(),
      }
    }
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
    case SET_DEFAULT_PAGE: {
      const _nextState = state
      _nextState.session.defaultPageId = action.payload.id
      // _nextState.userInfo.defaultPage = action.payload.id
      return _nextState
    }
    case CACHE_PUBLIC_SESSION: {
      return {
        ...state,
        session: action.payload.session,
      }
    }

    case SET_READ_ONLY: {
      return {
        ...state,
        isReadOnly: action.payload,
      }
    }

    case 'DB_BUSY': {
      return {
        ...state,
        isDbBusy: action.payload.isBusy,
        readsPending: action.payload.readsPending || 0,
        writesPending: action.payload.writesPending || 0,
      }
    }

    default:
      return state
  }
}
