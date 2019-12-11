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

      {state.modals.map((modal, i) =>
        modalDict[modal.component](
          modal.visible,
          modal.props.props,
          modal.props.dismiss
        )
      )}
    </NavigationContext.Provider>
  )
}

export const useNavigationContext = () => useContext(NavigationContext)

NavigationProvider.defaultProps = {
  initialState,
}

export default NavigationProvider
