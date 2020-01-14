import React, { createContext, useContext } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
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

  return (
    <NavigationContext.Provider
      value={{ ...state, showModal, hideModal, navigate }}
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
  initialState,
}

export default NavigationProvider
