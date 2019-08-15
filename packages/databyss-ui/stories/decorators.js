import React from 'react'
import Content from '@databyss-org/ui/components/Viewport/Content'
import Viewport from '@databyss-org/ui/components/Viewport/ThemedViewport'
import EditorProvider from '@databyss-org/ui/modules/Editor/EditorProvider'
import { reducer, initialState } from './../modules/Editor/reducer/mockReducer'
import { actions } from './../modules/Editor/actions/actions'

export const ServiceProviderDecorator = storyFn => (
  <EditorProvider
    initialState={initialState}
    reducer={reducer}
    actions={actions}
  >
    {storyFn()}
  </EditorProvider>
)

export const ViewportDecorator = storyFn => (
  <Viewport isFullscreen>{storyFn()}</Viewport>
)

export const ContentDecorator = storyFn => <Content>{storyFn()}</Content>
