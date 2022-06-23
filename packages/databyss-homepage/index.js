import React from 'react'
import ReactDOM from 'react-dom'
import { Helmet } from 'react-helmet'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@databyss-org/ui/theming'
import { Page } from './components/Page'
import homepageContent from './content/homepageContent.json'
import foundationContent from './content/foundationContent.json'

const globalStyles = () => ({
  '& a, & a:visited': {
    color: 'inherit',
  },
})

ReactDOM.render(
  <ThemeProvider globalStyles={globalStyles}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Page content={homepageContent} />} />
        <Route
          path="/foundation"
          element={<Page content={foundationContent} />}
        />
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
