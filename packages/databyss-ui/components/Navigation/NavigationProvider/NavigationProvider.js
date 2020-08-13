import React from 'react'
import queryString from 'query-string'
import { createContext, useContextSelector } from 'use-context-selector'
import { useNavigate, useLocation, Router } from '@reach/router'
import createReducer from '@databyss-org/services/lib/createReducer'
import reducer, { initialState } from './reducer'
import * as actions from './actions'

const useReducer = createReducer()

export const NavigationContext = createContext()

const withRouter = Wrapped => ({ children }) => (
  <Router>
    <Wrapped default>
      {React.cloneElement(React.Children.only(children), { default: true })}
    </Wrapped>
  </Router>
)

const NavigationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, {
    name: 'NavigationProvider',
  })

  const location = useLocation()

  const navigateRouter = useNavigate()

  const showModal = options => dispatch(actions.showModal(options))
  const setMenuOpen = bool => dispatch(actions.menuOpen(bool))

  const hideModal = () => dispatch(actions.hideModal())
  const navigate = options => {
    navigateRouter(options)
  }

  const navigateSidebar = options => dispatch(actions.navigateSidebar(options))

  const getTokensFromPath = () => {
    const _path = location.pathname.split('/')
    let _params = _path[2]
    let _anchor = ''

    if (_params === 'authors') {
      _params = _path[3]
    }

    if (_params && _params.includes('#')) {
      const _str = _params.split('#')
      _params = _str[0]
      _anchor = _str[1]
    }

    return { type: _path[1], params: _params, anchor: _anchor }
  }

  const getSidebarPath = () => {
    const _path = state.sidebarPath.split('/')
    const type = _path[1]
    if (type) {
      return type
    }

    return getTokensFromPath().type ? getTokensFromPath().type : 'pages'
  }

  const getQueryParams = () => queryString.parse(location.search)

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
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigationContext = (selector = x => x) =>
  useContextSelector(NavigationContext, selector)

NavigationProvider.defaultProps = {
  initialState,
}

export default withRouter(NavigationProvider)
