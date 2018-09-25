import React from 'react'
import Viewport from '../components/Viewport/Viewport'
import './globals.scss'

export const ViewportDecorator = storyFn => (
  <Viewport isFullscreen>{storyFn()}</Viewport>
)
