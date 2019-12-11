import React, { createContext, useContext } from 'react'
import createReducer from '@databyss-org/services/lib/createReducer'
import reducer, { initialState } from './reducer'
import { View, Button, Text, Grid } from '@databyss-org/ui/primitives'
import { modalDict } from './modalDict'

const useReducer = createReducer()

export const NavigationContext = createContext()

const NavigationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <NavigationContext.Provider value={[state, dispatch]}>
      {children}

      {state.modals.map(modal =>
        modalDict[modal.component]({
          visible: modal.visible,
          ...modal.props,
        })
      )}
    </NavigationContext.Provider>
  )
}

export const useNavigationContext = () => useContext(NavigationContext)

NavigationProvider.defaultProps = {
  initialState,
}

export default NavigationProvider
