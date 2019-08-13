import React from 'react'
import Content from '@databyss-org/ui/components/Viewport/Content'
import Viewport from '@databyss-org/ui/components/Viewport/ThemedViewport'
import { reducer, initialState } from './../modules/Editor/reducer/mockReducer'

import EditorProvider from '@databyss-org/services/editor/EditorProvider'

export const ServiceProviderDecorator = storyFn => (
  <EditorProvider initialState={initialState} reducer={reducer}>
    {storyFn()}
  </EditorProvider>
)

export const ViewportDecorator = storyFn => (
  <Viewport isFullscreen>{storyFn()}</Viewport>
)

export const ContentDecorator = storyFn => <Content>{storyFn()}</Content>
