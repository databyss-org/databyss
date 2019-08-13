import React, { createContext, useContext, useReducer } from 'react'

export const ServiceContext = createContext()

const EditorProvider = ({ reducer, initialState, children }) => {
  // const context = useReducer(reducer, initialState)

  return (
    <ServiceContext.Provider value={useReducer(reducer, initialState)}>
      {children}
    </ServiceContext.Provider>
  )
}

export const useStateValue = () => useContext(ServiceContext)

export const setRef = ({ ref, index }) => {
  return { type: 'SET_REF', data: { ref, index } }
}

export default EditorProvider
