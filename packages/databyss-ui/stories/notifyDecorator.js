import React from 'react'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'

export default storyFn => (
  <NotifyProvider envPrefix="WEB">{storyFn()}</NotifyProvider>
)
