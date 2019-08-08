import React from 'react'
import * as auth from '../auth'
import * as app from '../app'

export const ServiceContext = React.createContext()

const ServiceProvider = ({ services, children }) => (
  <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>
)

ServiceProvider.defaultProps = { services: { auth, app } }

export default ServiceProvider

/*

import React, { createContext, useContext, useReducer } from 'react'

export const ServiceContext = createContext()

const ServiceProvider = ({ reducer, initialState, children }) => (
  <ServiceContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </ServiceContext.Provider>
)

export const useStateValue = () => useContext(ServiceContext)

export default ServiceProvider

*/
