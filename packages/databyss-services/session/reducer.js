import {
  CACHE_SESSION,
  DENY_ACCESS,
  REQUEST_CODE,
  END_SESSION,
} from './constants'

export const initialState = {
  // session is either `null`, `Error` or {user: {}, account: {}}
  session: null,
  // in TFA (like email login/register), this is set to true after email is sent
  //   and reset to false on successful authentication and on end session
  requestCode: false,
}

export default (state, action) => {
  switch (action.type) {
    case REQUEST_CODE: {
      return {
        ...state,
        requestCode: true,
      }
    }
    case CACHE_SESSION: {
      return {
        ...state,
        session: action.payload.session,
        requestCode: false,
      }
    }
    case DENY_ACCESS: {
      return {
        ...state,
        session: action.payload.error,
      }
    }
    case END_SESSION: {
      return initialState
    }
    default:
      return state
  }
}
