import React, { useEffect, useCallback } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import { useQueryClient } from '@tanstack/react-query'
import Login from '@databyss-org/ui/modules/Login/Login'
import LoadingIcon from '@databyss-org/ui/assets/loading.svg'
import {
  syncPouchDb,
  dbRef,
  initDb,
  selectors,
} from '@databyss-org/data/pouchdb/db'
import { Text, View, Viewport } from '@databyss-org/ui'
import Loading from '@databyss-org/ui/components/Notify/LoadingFallback'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation'
import { useGroups } from '@databyss-org/data/pouchdb/hooks'
import { UNTITLED_NAME } from '@databyss-org/services/groups'
import { isMobile, isMobileOs } from '@databyss-org/ui/lib/mediaQuery'
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
import { sleep, urlSafeName } from '../lib/util'
import { getAccountFromLocation } from './utils'
import { useDatabaseContext } from '../lib/DatabaseProvider'
import { sortEntriesByRecent } from '../entries/util'

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
  isLocalSession,
}) => {
  const [state, dispatch, stateRef] = useReducer(reducer, initialState, {
    name: 'SessionProvider',
  })
  const { notify } = useNotifyContext()
  const location = useNavigationContext((c) => c && c.location)
  const navigate = useNavigationContext((c) => c && c.navigate)
  const getSidebarPath = useNavigationContext((c) => c && c.getSidebarPath)
  const navigateSidebar = useNavigationContext((c) => c && c.navigateSidebar)
  const { updateDatabaseStatus, setCouchMode } = useDatabaseContext()
  const groupRes = useGroups({
    enabled: !!dbRef.current && !!state.session?.publicAccount,
  })
  const queryClient = useQueryClient()

  const localSession = {
    user: {
      email: 'local@user.com',
    },
    account: {
      _id: dbRef.groupId,
    },
    defaultGroupId: dbRef.groupId.startsWith('g_')
      ? dbRef.groupId
      : `g_${dbRef.groupId}`,
  }

  const isPublicAccount = useCallback(() => {
    if (isLocalSession && eapi.isWeb) {
      return true
    }
    if (state.session.publicAccount?._id) {
      return true
    }
    return false
  }, [state.session?.publicAccount])

  const getUserAccount = useCallback(() => {
    if (isLocalSession) {
      return localSession.user
    }
    if (state.userInfo) {
      return state.userInfo
    }
    dispatch(actions.getUserAccount())
    return null
  }, [state.userInfo])

  const getCurrentAccount = useCallback(() => {
    if (isLocalSession) {
      return localSession.account._id
    }
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
      if (isLocalSession) {
        return localSession
      }
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

  const endSession = () => {
    if (isLocalSession) {
      return
    }
    dispatch(actions.endSession())
  }

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
          queryClient,
          onReplicationComplete: (_res) => {
            updateDatabaseStatus()
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
          queryClient,
          groupId: _publicSession.belongsToGroup,
          isPublicGroup: true,
          onReplicationComplete: () => updateDatabaseStatus(),
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
            queryClient,
            groupId: unauthenticatedGroupId,
            isPublicGroup: true,
            onReplicationComplete: () => updateDatabaseStatus(),
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

    if (isLocalSession) {
      console.log('[SessionProvider] local session')
      state.session = localSession
      // dbRef.current = vouchDbRef.current
    }

    if (state.sesson === null) {
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
    if (isLocalSession) {
      return
    }
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

  const logout = useCallback(() => {
    if (isLocalSession) {
      console.warn('[Session] not implemented in local session: logout')
      return
    }
    dispatch(actions.logout())
  }, [actions.logout])

  /**
   * checks on window focus if user should be forced logged out
   */
  const shouldForceLogout = () => {
    if (localSession) {
      return
    }
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
    if (isLocalSession) {
      console.warn('[Session] not implemented in local session: setDefaultPage')
      return
    }
    dispatch(actions.onSetDefaultPage(id))
  }, [])

  const getDefaultPage = useCallback(
    (pages) => {
      const _pinning = stateRef.current.session?.publicAccount
      // console.log('[getDefaultPage]', _pinning)
      return sortEntriesByRecent(Object.values(pages), null, _pinning).filter(
        (p) => !p.archive
      )[0]
    },
    [stateRef.current]
  )

  const getDefaultPageUrl = useCallback(async ({ pages, defaultGroupId }) => {
    // let _groupName = ''
    // if (defaultGroupName) {
    //   _groupName = `${urlSafeName(defaultGroupName)}-`
    // }

    let defaultPage = null

    // return default page from user prefs, if possible
    const _userPreference = await dbRef.current.get('user_preference')
    const _group = _userPreference?.groups?.[0]
    defaultPage = pages[_group?.defaultPageId]
    if (!defaultPage) {
      defaultPage = getDefaultPage(pages)
    }
    const pageUrl = `${defaultPage._id}/${urlSafeName(defaultPage.name)}`
    // return `/${_groupName}${defaultGroupId.substring(2)}/pages/${pageUrl}`
    return `/${defaultGroupId}/pages/${pageUrl}`
  }, [])

  const navigateToDefaultPage = useCallback(
    async (replace = true) => {
      const _lastRoute = await eapi.state.get('lastRoute')
      // console.log(
      //   '[SessionProvider] lastRoute',
      //   _lastRoute,
      //   state.session.defaultGroupId
      // )
      if (
        _lastRoute?.includes(state.session.defaultGroupId) &&
        _lastRoute !== location.pathname
      ) {
        navigate(_lastRoute)
        navigateSidebar(getSidebarPath(true))
        return
      }

      while (!state.session.defaultGroupId) {
        await sleep(100)
      }
      // console.log(
      //   '[SessionProvider] defaultGroupId',
      //   state.session.defaultGroupId
      // )
      const { defaultGroupId } = state.session

      let pages = null
      do {
        await sleep(100)
        pages = queryClient.getQueryData([selectors.PAGES])
      } while (!pages)

      const pageUrl = await getDefaultPageUrl({ pages, defaultGroupId })

      navigate(pageUrl, {
        hasAccount: true,
        replace,
      })
    },
    [getDefaultPage, state.session, location]
  )

  useEffect(() => {
    dispatch(
      actions.setReadOnly(
        dbRef.readOnly ||
          isPublicAccount() ||
          !!isMobileOs() ||
          window.location.search.includes('__readonly')
      )
    )
  }, [dbRef.readOnly])

  return (
    <SessionContext.Provider
      value={{
        ...state,
        setDefaultPage,
        getDefaultPage,
        getDefaultPageUrl,
        navigateToDefaultPage,
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
          !dbRef.initialSyncComplete &&
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
