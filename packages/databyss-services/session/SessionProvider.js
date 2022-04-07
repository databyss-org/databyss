import React, { useEffect, useCallback } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
// import { debounce } from 'lodash'
import Login from '@databyss-org/ui/modules/Login/Login'
import LoadingIcon from '@databyss-org/ui/assets/loading.svg'
import { syncPouchDb, dbRef, initDb } from '@databyss-org/data/pouchdb/db'
import { Text, View, Viewport } from '@databyss-org/ui'
// import { connect } from '@databyss-org/data/couchdb-client/couchdb'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { UNTITLED_NAME } from '@databyss-org/services/groups'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import StickyMessage from '@databyss-org/ui/components/Notify/StickyMessage'
import { ResourcePending } from '../interfaces/ResourcePending'
import createReducer from '../lib/createReducer'
import reducer, { initialState } from './reducer'
import * as actions from './actions'
import {
  localStorageHasSession,
  localStorageHasPublicSession,
  getDefaultGroup,
} from './clientStorage'
import { CACHE_SESSION, CACHE_PUBLIC_SESSION } from './constants'
import { hasUnathenticatedAccess } from './actions'
import { NetworkUnavailableError } from '../interfaces'
import { urlSafeName } from '../lib/util'
import { getAccountFromLocation } from './utils'
import { useDatabaseContext } from '../lib/DatabaseProvder'

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
  const [state, dispatch, stateRef] = useReducer(reducer, initialState, {
    name: 'SessionProvider',
  })
  const { notify } = useNotifyContext()
  const location = useNavigationContext((c) => c && c.location)
  const navigate = useNavigationContext((c) => c && c.navigate)
  const { updateCouchMode, setCouchMode } = useDatabaseContext()
  const groupRes = useGroups({
    enabled: !!dbRef.current && !!state.session?.publicAccount,
  })

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
      // do we have an authenticated session in the browser?
      const _sesionFromLocalStorage = await localStorageHasSession()
      if (_sesionFromLocalStorage) {
        console.log('[SessionProvider] 2nd pass')
        // 2nd pass: load session from local_storage
        // replicate from cloudant
        const groupId = _sesionFromLocalStorage.defaultGroupId
        // download remote database if not on mobile

        setCouchMode(true)
        await initDb({
          groupId,
          dispatch,
          stateRef,
          onReplicationComplete: (_res) => {
            updateCouchMode()
            if (_res) {
              // set up live sync
              syncPouchDb({
                groupId,
              })
            }
          },
        })

        dispatch({
          type: CACHE_SESSION,
          payload: {
            session: _sesionFromLocalStorage,
          },
        })
        return
      }

      // do we have a public group in localstorage?
      let _publicSession = await localStorageHasPublicSession()
      if (_publicSession) {
        console.log('[SessionProvider] has public session')
        // start replication on public group
        // await replicateGroup(_publicSession.belongsToGroup)
        setCouchMode(true)
        await initDb({
          groupId: _publicSession.belongsToGroup,
          isPublicGroup: true,
          onReplicationComplete: () => updateCouchMode(),
        })
      } else {
        // try to get public access
        console.log('[SessionProvider] get public access')
        const unauthenticatedGroupId = await hasUnathenticatedAccess()
        console.log(
          '[SessionProvider] unauthenticatedGroupId',
          unauthenticatedGroupId
        )

        if (unauthenticatedGroupId) {
          setCouchMode(true)
          await initDb({
            groupId: unauthenticatedGroupId,
            isPublicGroup: true,
            onReplicationComplete: () => updateCouchMode(),
          })
          _publicSession = await localStorageHasPublicSession(3)
        }
      }
      if (_publicSession) {
        dispatch({
          type: CACHE_PUBLIC_SESSION,
          payload: {
            session: {
              defaultPageId: _publicSession.defaultPageId,
              defaultGroupId: _publicSession._id,
              defaultGroupName: _publicSession.name,
              publicAccount: {
                _id: _publicSession._id,
              },
              notifications: _publicSession.notifications ?? [],
            },
          },
        })
        dbRef.readOnly = true
      } else {
        console.log('[SessionProvider] no public session')
        // if user has a default groupId in local storage, change url and retry session _init
        const _hasDefaultGroup = getDefaultGroup()
        const _hasSession = await localStorageHasSession()
        if (
          _hasDefaultGroup &&
          _hasSession &&
          // && !_hasRetriedSession
          !process.env.STORYBOOK
        ) {
          // user is logged in
          console.log('[SessionProvider] already logged in')
          window.location.href = '/'
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

  const _group = groupRes.data ? Object.values(groupRes.data)[0] : null
  const _fullUrlFromGroupId = (groupIdWithName) => {
    let _url = `/${groupIdWithName}/${location.pathname
      .split('/')
      .splice(2)
      .join('/')}`
    if (location.search) {
      _url = `${_url}?${location.search}`
    }
    if (location.hash) {
      _url = `${_url}#${location.search}`
    }
    return _url
  }
  const _updatePublicGroupInUrl = () => {
    if (_group?.name === UNTITLED_NAME) {
      return
    }
    if (!_group?.name) {
      return
    }
    const _groupIdWithName = getAccountFromLocation(true)
    const _defaultGroupIdWithName = `${urlSafeName(
      _group.name
    )}-${_group._id.substring(2)}`
    if (_defaultGroupIdWithName !== _groupIdWithName) {
      // console.log('[SessionProvider]', _url)
      navigate(_fullUrlFromGroupId(_defaultGroupIdWithName), {
        replace: true,
        hasAccount: true,
      })
    }
  }
  useEffect(() => {
    if (isPublicAccount()) {
      _updatePublicGroupInUrl()
    } else {
      const _groupInUrl = location.pathname.split('/')[1]
      if (_groupInUrl.match(/^(p_|g_)/)) {
        navigate(_fullUrlFromGroupId(_groupInUrl.substring(2)), {
          replace: true,
          hasAccount: true,
        })
      }
    }
  }, [_group?.name])

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
    _children = (
      <Viewport>
        <Loading
          showLongWaitMessage
          splashOnLongWait
          longWaitDialogOptions={{
            nude: true,
            message: 'Loading Databyss collection...',
          }}
        />
      </Viewport>
    )
  }

  const logout = () => {
    dispatch(actions.logout())
  }

  /**
   * checks on window focus if user should be forced logged out
   */
  const shouldForceLogout = () => {
    if (
      !(state.session instanceof ResourcePending) &&
      !document.hidden &&
      !state?.session?.publicAccount &&
      !getDefaultGroup() &&
      dbRef.current
    ) {
      window.location.href = '/'
    }
  }

  window.addEventListener('focus', shouldForceLogout)

  const setDefaultPage = useCallback((id) => {
    dispatch(actions.onSetDefaultPage(id))
  }, [])

  useEffect(() => {
    dispatch(
      actions.setReadOnly(
        dbRef.readOnly ||
          isPublicAccount() ||
          !!isMobile() ||
          window.location.search.includes('__readonly')
      )
    )
  }, [dbRef.readOnly])

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
      <StickyMessage
        canDismiss={false}
        visible={
          state.session &&
          !(state.session instanceof ResourcePending) &&
          !(state.session instanceof Error) &&
          dbRef.readOnly &&
          !isPublicAccount() &&
          !isMobile()
        }
        rightAlignChildren={<LoadingIcon width={20} height={20} />}
      >
        <View flexDirection="row" alignItems="center">
          <Text variant="uiTextNormal">
            Sync in progress. Your Databyss will be in read-only mode until the
            sync finishes.
          </Text>
        </View>
      </StickyMessage>
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
