import React, { createContext, useContext, useReducer } from 'react'

export const ServiceContext = createContext()

const EditorProvider = ({ reducer, initialState, children, actions }) => {
  // const context = useReducer(reducer, initialState)
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <ServiceContext.Provider value={[state, actions(dispatch, state)]}>
      {children}
    </ServiceContext.Provider>
  )
}

export const useProviderContext = () => useContext(ServiceContext)

export default EditorProvider
