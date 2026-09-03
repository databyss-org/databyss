import React from 'react'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import { Viewport } from '@databyss-org/ui'
import FirefoxWarning from '@databyss-org/ui/components/Notify/FirefoxWarning'
import Public from './Public'

const App = () => (
  <Viewport p={0}>
    <NotifyProvider>
      <FirefoxWarning />
      <Public />
    </NotifyProvider>
  </Viewport>
)

export default App
