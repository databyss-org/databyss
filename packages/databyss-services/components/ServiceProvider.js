import React from 'react'
import * as auth from '../auth'

export const ServiceContext = React.createContext()

const ServiceProvider = ({ services, children }) => (
  <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>
)

ServiceProvider.defaultProps = { services: { auth } }

export default ServiceProvider
