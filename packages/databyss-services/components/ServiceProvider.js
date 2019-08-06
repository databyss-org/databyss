import React from 'react'
import * as auth from '../auth'
import * as app from '../app'

export const ServiceContext = React.createContext()

const ServiceProvider = ({ services, children }) => (
  <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>
)

ServiceProvider.defaultProps = { services: { auth, app } }

export default ServiceProvider
