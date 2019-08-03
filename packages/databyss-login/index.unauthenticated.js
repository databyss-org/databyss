import React from 'react'
import ReactDOM from 'react-dom'
import ThemeProvider from '@databyss-org/ui/theming/ThemeProvider'
import ServiceProvider from '@databyss-org/services/components/ServiceProvider'
import Login from './src/Login'

const App = () => (
  <ServiceProvider>
    <ThemeProvider>
      <Login />
    </ThemeProvider>
  </ServiceProvider>
)

ReactDOM.render(<App />, document.getElementById('root'))
