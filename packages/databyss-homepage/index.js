import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from '@databyss-org/ui/theming'
import Homepage from '@databyss-org/ui/modules/Homepage/Homepage'

const globalStyles = () => ({
  '& a, & a:visited': {
    color: 'inherit',
  },
})

ReactDOM.render(
  <ThemeProvider globalStyles={globalStyles}>
    <Homepage />
  </ThemeProvider>,
  document.getElementById('root')
)
