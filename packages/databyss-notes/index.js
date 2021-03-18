import React from 'react'
import ReactDOM from 'react-dom'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { ThemeProvider } from '@databyss-org/ui/theming'
import App from './app/App'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <ThemeProvider>
    <NavigationProvider>
      <App />
    </NavigationProvider>
  </ThemeProvider>,
  document.getElementById('root')
)

serviceWorker.register()
