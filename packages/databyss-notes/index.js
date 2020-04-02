import React from 'react'
import ReactDOM from 'react-dom'
import { NavigationRouter } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { ThemeProvider } from '@databyss-org/ui/theming'
import App from './src/App'

ReactDOM.render(
  <ThemeProvider>
    <NavigationRouter>
      <App />
    </NavigationRouter>
  </ThemeProvider>,
  document.getElementById('root')
)
