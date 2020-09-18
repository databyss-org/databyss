import React from 'react'
import ReactDOM from 'react-dom'

import { NavigationProvider } from '@databyss-org/ui'
import { ThemeProvider } from '@databyss-org/ui/theming'

import App from './components/App'

ReactDOM.render(
  <ThemeProvider>
    <NavigationProvider>
      <App />
    </NavigationProvider>
  </ThemeProvider>,
  document.getElementById('root')
)
