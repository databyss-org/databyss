import React from 'react'
import Content from '@databyss-org/ui/components/Viewport/Content'
import Viewport from '@databyss-org/ui/components/Viewport/ThemedViewport'

export const ViewportDecorator = storyFn => (
  <Viewport isFullscreen>{storyFn()}</Viewport>
)

export const ContentDecorator = storyFn => <Content>{storyFn()}</Content>
