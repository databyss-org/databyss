import React, { createContext, useContext, useReducer } from 'react'

export const ServiceContext = createContext()

const ServiceProvider = ({ reducer, initialState, children }) => (
  <ServiceContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </ServiceContext.Provider>
)

export const useStateValue = () => useContext(ServiceContext)

export default ServiceProvider
