import React from 'react'
import Content from '@databyss-org/ui/components/Viewport/Content'
import Viewport from '@databyss-org/ui/components/Viewport/ThemedViewport'
import * as app from '@databyss-org/services/app/mocks'

import ServiceProvider from '@databyss-org/services/components/ServiceProvider'

const services = { app }

export const ServiceProviderDecorator = storyFn => (
  <ServiceProvider services={services}>{storyFn()}</ServiceProvider>
)

export const ViewportDecorator = storyFn => (
  <Viewport isFullscreen>{storyFn()}</Viewport>
)

export const ContentDecorator = storyFn => <Content>{storyFn()}</Content>
