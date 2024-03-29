import React, { PropsWithChildren, useEffect } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import { useNavigate, useLocation } from 'react-router-dom'
import createReducer from '@databyss-org/services/lib/createReducer'
import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import { AuthorName } from '@databyss-org/services/interfaces'
import { resetScrollMemoryBeforeNavigate } from '@databyss-org/ui/hooks/scrollMemory/useScrollMemory'
import reducer, { initialState } from './reducer'
import * as actions from './actions'
import {
  ModalOptions,
  NavigateOptions,
  NavigationState,
  PathTokens,
} from './interfaces'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../../../databyss-desktop/src/eapi').default

interface ContextType extends NavigationState {
  location: Location
  setMenuOpen: (isOpen: boolean) => void
  isMenuOpen: boolean
  showModal: (options: ModalOptions) => void
  hideModal: () => void
  navigate: (url: string, options: NavigateOptions) => void
  getTokensFromPath: () => PathTokens
  navigateSidebar: (path: string) => void
  getSidebarPath: () => string
  getQueryParams: () => { [key: string]: string }
  getAccountFromLocation: () => string | boolean
}

const useReducer = createReducer()

export const NavigationContext = createContext<ContextType>(null!)

const sidebarItemAliases = {
  collections: 'groups',
  embeds: 'media',
}

interface PropsType {
  initialState: NavigationState
}

export const NavigationProvider = ({
  children,
  initialState = new NavigationState(),
}: PropsWithChildren<PropsType>) => {
  const [state, dispatch] = useReducer(reducer, initialState, {
    name: 'NavigationProvider',
  })

  useEffect(() => {
    eapi.state.get('sidebarVisible').then((visible) => {
      dispatch(actions.menuOpen(visible))
    })
  }, [])

  const location = useLocation()

  if (eapi) {
    const _path = location.pathname.split('/')
    if (_path.length > 3) {
      // console.log('[NavigationProvider] set lastRoute', location.pathname)
      eapi.state.set('lastRoute', location.pathname)
    }
  }

  const navigateRouter = useNavigate()

  const showModal = (options) => dispatch(actions.showModal(options))
  const setMenuOpen = (bool) => {
    eapi.state.set('sidebarVisible', bool)
    dispatch(actions.menuOpen(bool))
  }

  const hideModal = () => dispatch(actions.hideModal())
  const navigate = (url, options) => {
    const accountId = getAccountFromLocation()
    const accountIdWithName = getAccountFromLocation(true)
    const hasAccount =
      options?.hasAccount ||
      (accountIdWithName && url.match(`/${accountIdWithName}/`))
    const replace = !!options?.replace
    let _url = url
    if (!hasAccount) {
      _url = accountId
        ? `/${accountIdWithName}${url.replace(`/${accountId}/`, '/')}`
        : url
    }
    resetScrollMemoryBeforeNavigate(_url)
    navigateRouter(_url, { replace })
  }

  const navigateSidebar = (options) => {
    if (eapi) {
      eapi.state.set('lastSidebarRoute', options)
    }
    dispatch(actions.navigateSidebar(options))
  }

  const getQueryParams = () => location.search

  const getTokensFromPath = (): {
    type: string
    params: string
    anchor: string
    author: AuthorName | null
    nice: string[]
  } => {
    const _path = location.pathname.split('/')
    const params = _path[3]
    let anchor = ''
    const nice = _path.slice(4)

    if (location.hash) {
      anchor = location.hash.substring(1)
    }

    const type: string = _path[2]

    let author: AuthorName | null = null
    if (type === 'sources' && !params) {
      const _queryParams = new URLSearchParams(getQueryParams())
      if (_queryParams.get('firstName') || _queryParams.get('lastName')) {
        author = {
          firstName: decodeURIComponent(_queryParams.get('firstName')!),
          lastName: decodeURIComponent(_queryParams.get('lastName')!),
        }
      }
    }

    return { type, params, anchor, author, nice }
  }

  const getSidebarPath = (derive?: boolean) => {
    if (!derive) {
      const _path = state.sidebarPath.split('/')
      const type = _path[1]
      if (type) {
        return type
      }
    }

    // determine path from location
    const _item = getTokensFromPath().type
    const _derivedPath = sidebarItemAliases[_item] || _item || 'pages'
    navigateSidebar(`/${_derivedPath}`)
    return _derivedPath

    // TODO: within PageContent (or wherever we mount a <PageLoader>), check if archive
    // flag is set. If so, nagivate the sidebar to the archive tab
  }

  return (
    <NavigationContext.Provider
      value={{
        ...state,
        location,
        setMenuOpen,
        isMenuOpen: state.menuOpen,
        showModal,
        hideModal,
        navigate,
        getTokensFromPath,
        navigateSidebar,
        getSidebarPath,
        getQueryParams,
        getAccountFromLocation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigationContext = (selector = (x) => x) =>
  useContextSelector(NavigationContext, selector)

NavigationProvider.defaultProps = {
  initialState,
}
