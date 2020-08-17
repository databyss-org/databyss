import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from '@databyss-org/ui/theming'
import Homepage from '@databyss-org/ui/modules/Homepage/Homepage'

ReactDOM.render(
  <ThemeProvider>
    <Homepage />
  </ThemeProvider>,
  document.getElementById('root')
)
