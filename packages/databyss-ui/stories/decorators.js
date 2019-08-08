import React from 'react'
import Content from '@databyss-org/ui/components/Viewport/Content'
import Viewport from '@databyss-org/ui/components/Viewport/ThemedViewport'
import {
  reducer,
  initialState,
} from '@databyss-org/services/app/mockReducer.js'
// import * as app from '@databyss-org/services/app/mocks'

import ServiceProvider from '@databyss-org/services/components/ServiceProvider'

export const ServiceProviderDecorator = storyFn => (
  <ServiceProvider initialState={initialState} reducer={reducer}>
    {storyFn()}
  </ServiceProvider>
)

export const ViewportDecorator = storyFn => (
  <Viewport isFullscreen>{storyFn()}</Viewport>
)

export const ContentDecorator = storyFn => <Content>{storyFn()}</Content>
