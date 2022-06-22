import React from 'react'
import ReactDOM from 'react-dom'
import { Helmet } from 'react-helmet'
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
    <Helmet>
      <script
        type="text/javascript"
        defer
        src="https://donorbox.org/install-popup-button.js"
      ></script>
    </Helmet>
  </ThemeProvider>,
  document.getElementById('root')
)

window.DonorBox = { widgetLinkClassName: 'custom-dbox-popup' }
