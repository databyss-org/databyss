import React from 'react'
import NotifyProvider from '@databyss-org/ui/components/Notify/NotifyProvider'
import Public from '@databyss-org/notes/app/Public'

// component
const App = () => (
  <NotifyProvider>
    <Public />
  </NotifyProvider>
)

export default App
