import React from 'react'
import ServiceProvider from '@databyss-org/services/components/ServiceProvider'
import * as auth from '@databyss-org/services/auth/mocks'

const services = { auth }

export const ServiceProviderDecorator = storyFn => (
  <ServiceProvider services={services}>{storyFn()}</ServiceProvider>
)
