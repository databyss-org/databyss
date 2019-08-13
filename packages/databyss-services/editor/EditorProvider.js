import React, { createContext, useContext, useReducer } from 'react'

export const ServiceContext = createContext()

const EditorProvider = ({ reducer, initialState, children, actions }) => {
  // const context = useReducer(reducer, initialState)
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <ServiceContext.Provider value={[state, actions(dispatch)]}>
      {children}
    </ServiceContext.Provider>
  )
}

export const useProviderContext = () => useContext(ServiceContext)

export const setRef = ({ ref, index }) => {
  return { type: 'SET_REF', data: { ref, index } }
}

export default EditorProvider
