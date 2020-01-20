import React, { createContext, useContext } from 'react'
import * as session from '../session/actions'

export const ServiceContext = createContext()

const ServiceProvider = ({ actions, children }) => (
  <ServiceContext.Provider value={actions}>{children}</ServiceContext.Provider>
)

export const useServiceContext = () => useContext(ServiceContext)

ServiceProvider.defaultProps = {
  actions: { session },
}

export default ServiceProvider
