import React from 'react'
import ReactDOM from 'react-dom'
import { Helmet } from 'react-helmet'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@databyss-org/ui/theming'
import Homepage from './modules/Homepage/Homepage'

const globalStyles = () => ({
  '& a, & a:visited': {
    color: 'inherit',
  },
})

ReactDOM.render(
  <ThemeProvider globalStyles={globalStyles}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        {/* <Route path="/foundation" element={<Homepage />} /> */}
      </Routes>
    </BrowserRouter>
    <Helmet>
      <script
        type="text/javascript"
        defer
        src="https://donorbox.org/install-popup-button.js"
      />
    </Helmet>
  </ThemeProvider>,
  document.getElementById('root')
)

window.DonorBox = { widgetLinkClassName: 'custom-dbox-popup' }
