import React from 'react'
import ReactDOM from 'react-dom'
import {
  NavigationProvider,
  BrowserRouter,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { ThemeProvider } from '@databyss-org/ui/theming'

import App from './components/App'

ReactDOM.render(
  <ThemeProvider>
    <BrowserRouter>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById('root')
)
