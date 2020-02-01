import React from 'react'
import ReactDOM from 'react-dom'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import App from './src/App'

ReactDOM.render(
  <NavigationProvider>
    <App />
  </NavigationProvider>,
  document.getElementById('root')
)
