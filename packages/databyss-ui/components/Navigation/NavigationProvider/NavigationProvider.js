import React, { createContext, useContext } from 'react'
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

  const showModal = options => dispatch(actions.showModal(options))
  const hideModal = () => dispatch(actions.hideModal())
  const navigate = options => dispatch(actions.navigate(options))

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

  return (
    <NavigationContext.Provider
      value={{ ...state, showModal, hideModal, navigate, getTokensFromPath }}
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

export default NavigationProvider
