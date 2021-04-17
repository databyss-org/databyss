import React, { PropsWithChildren } from 'react'
import { createContext, useContextSelector } from 'use-context-selector'
import {
  useNavigate,
  useLocation,
  Router as ReachRouter,
} from '@databyss-org/reach-router'
import createReducer from '@databyss-org/services/lib/createReducer'
import { getAccountFromLocation } from '@databyss-org/services/session/utils'
import reducer, { initialState } from './reducer'
import * as actions from './actions'
import {
  ModalOptions,
  NavigateOptions,
  NavigationState,
  PathTokens,
} from './interfaces'

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

const RouteWrapper = ({ children }) => <>{children}</>
export const Router = ({ children, ...others }) => (
  <ReachRouter primary={false} component={RouteWrapper} {...others}>
    {children}
  </ReachRouter>
)

const withRouter = (Wrapped) => ({ children }) => (
  <Router>
    <Wrapped default>
      {React.cloneElement(React.Children.only(children), { default: true })}
    </Wrapped>
  </Router>
)

const sidebarItemAliases = {
  collections: 'groups',
}

interface PropsType {
  initialState: NavigationState
}

const NavigationProvider = ({
  children,
  initialState = new NavigationState(),
}: PropsWithChildren<PropsType>) => {
  const [state, dispatch] = useReducer(reducer, initialState, {
    name: 'NavigationProvider',
  })

  const location = useLocation()

  const navigateRouter = useNavigate()

  const showModal = (options) => dispatch(actions.showModal(options))
  const setMenuOpen = (bool) => dispatch(actions.menuOpen(bool))

  const hideModal = () => dispatch(actions.hideModal())
  const navigate = (url, options) => {
    const accountId = getAccountFromLocation()
    const hasAccount =
      options?.hasAccount || (accountId && url.match(`/${accountId}/`))
    if (hasAccount) {
      navigateRouter(url)
      return
    }
    navigateRouter(accountId ? `/${accountId}${url}` : url)
  }

  const navigateSidebar = (options) =>
    dispatch(actions.navigateSidebar(options))

  const getTokensFromPath = () => {
    const _path = location.pathname.split('/')
    let _params = _path[3]
    let _anchor = ''

    if (_params === 'authors') {
      _params = _path[4]
    }

    if (_params && _params.includes('#')) {
      const _str = _params.split('#')
      _params = _str[0]
      _anchor = _str[1]
    }

    return { type: _path[2], params: _params, anchor: _anchor }
  }

  const getSidebarPath = () => {
    const _path = state.sidebarPath.split('/')
    const type = _path[1]
    if (type) {
      return type
    }

    // determine path from location
    const _item = getTokensFromPath().type
    const _derivedPath = sidebarItemAliases[_item] || _item || 'pages'
    navigateSidebar(`/${_derivedPath}`)
    return _derivedPath

    // TODO: within PageContent (or wherever we mount a <PageLoader>), check if archive
    // flag is set. If so, nagivate the sidebar to the archive tab
  }

  const getQueryParams = () => location.search

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

export default withRouter(NavigationProvider)
