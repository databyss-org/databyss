import React from 'react'
import Viewport from '../components/Viewport/ThemedViewport'

export const ViewportDecorator = storyFn => (
  <Viewport isFullscreen>{storyFn()}</Viewport>
)
