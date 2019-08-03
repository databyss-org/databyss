import React from 'react'
import ReactDOM from 'react-dom'
import ThemeProvider from '@databyss-org/ui/theming/ThemeProvider'
import ServiceProvider from '@databyss-org/services/components/ServiceProvider'
import LoginApp from './src/App'

const App = () => (
  <ServiceProvider>
    <ThemeProvider>
      <LoginApp />
    </ThemeProvider>
  </ServiceProvider>
)

ReactDOM.render(<App />, document.getElementById('root'))
