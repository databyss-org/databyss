import React from 'react'
import Content from '@databyss-org/ui/components/Viewport/Content'
import Viewport from '@databyss-org/ui/components/Viewport/ThemedViewport'
import { reducer, initialState } from './../modules/Editor/reducer/mockReducer'

import ServiceProvider from '@databyss-org/services/editor/ServiceProvider'

export const ServiceProviderDecorator = storyFn => (
  <ServiceProvider initialState={initialState} reducer={reducer}>
    {storyFn()}
  </ServiceProvider>
)

export const ViewportDecorator = storyFn => (
  <Viewport isFullscreen>{storyFn()}</Viewport>
)

export const ContentDecorator = storyFn => <Content>{storyFn()}</Content>
