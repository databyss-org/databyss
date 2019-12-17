import React, { createContext, useContext } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
import reducer, { initialState } from './reducer'

const useReducer = createReducer()

export const NavigationContext = createContext()

const NavigationProvider = ({ children, modalDict }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <NavigationContext.Provider value={[state, dispatch]}>
      {children}

      {state.modals.map(modal => {
        const ModalComponent = modalDict[modal.component]
        return <ModalComponent visible={modal.visible} {...modal.props} />
      })}
    </NavigationContext.Provider>
  )
}

export const useNavigationContext = () => useContext(NavigationContext)

NavigationProvider.defaultProps = {
  initialState,
}

export default NavigationProvider
