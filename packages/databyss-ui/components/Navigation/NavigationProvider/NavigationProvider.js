import React, { createContext, useContext } from 'react'
import { useNavigate, Router } from '@reach/router'
import createReducer from '@databyss-org/services/lib/createReducer'
import componentMap from './componentMap'
import reducer, { initialState } from './reducer'
import * as actions from './actions'

const useReducer = createReducer()

export const NavigationContext = createContext()

const NavigationProvider = ({ children, componentMap, initialPath }) => {
  const [state, dispatch] = useReducer(
    reducer,
    {
      ...initialState,
      path: initialPath || initialState.path,
    },
    { name: 'NavigationProvider' }
  )

  const navigateRouter = useNavigate()

  const showModal = options => dispatch(actions.showModal(options))
  const setMenuOpen = bool => dispatch(actions.menuOpen(bool))

  const hideModal = () => dispatch(actions.hideModal())
  const navigate = options => {
    navigateRouter(options, { replace: true })
    // TODO: remove next line
    return dispatch(actions.navigate(options))
  }

  const navigateSidebar = options => dispatch(actions.navigateSidebar(options))

  const getTokensFromPath = () => {
    const _path = state.path.split('/')
    let _id = _path[2]
    let _anchor = ''

    if (_id && _id.includes('#')) {
      const _str = _id.split('#')
      _id = _str[0]
      _anchor = _str[1]
    }

    return { type: _path[1], id: _id, anchor: _anchor }
  }

  const getSidebarPath = () => {
    const _path = state.sidebarPath.split('/')
    const type = _path[1]
    if (type) {
      return type
    }
    return null
  }

  return (
    <NavigationContext.Provider
      value={{
        ...state,
        setMenuOpen,
        isMenuOpen: state.menuOpen,
        showModal,
        hideModal,
        navigate,
        getTokensFromPath,
        navigateSidebar,
        getSidebarPath,
      }}
    >
      {children}

      {state.modals.map((modal, i) => {
        const ModalComponent = componentMap[modal.component]
        return (
          <ModalComponent visible={modal.visible} key={i} {...modal.props} />
        )
      })}
    </NavigationContext.Provider>
  )
}

const NavigationWrapper = ({ _children, ...other }) => (
  <NavigationProvider {...other}>{_children}</NavigationProvider>
)

export const NavigationRouter = ({ children }) => (
  <Router>
    <NavigationWrapper default _children={children} />
  </Router>
)

export const useNavigationContext = () => useContext(NavigationContext)

NavigationProvider.defaultProps = {
  componentMap,
  initialState,
}

export default NavigationProvider
