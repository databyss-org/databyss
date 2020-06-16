import React, { createContext, useContext } from 'react'
import { useNavigate, useLocation, Router } from '@reach/router'
import createReducer from '@databyss-org/services/lib/createReducer'
import componentMap from './componentMap'
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

const NavigationProvider = ({ children, componentMap }) => {
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
    return getTokensFromPath().type ? getTokensFromPath().type : 'pages'
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

export const useNavigationContext = () => useContext(NavigationContext)

NavigationProvider.defaultProps = {
  componentMap,
  initialState,
}

export default withRouter(NavigationProvider)
