import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@databyss-org/ui/theming'
import { Page } from './components/Page'
import homepageContent from './content/homepageContent.json'
import foundationContent from './content/foundationContent.json'
import { EmbedDonorbox, DonorboxPopup } from './components/Donorbox'

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
        <Route path="/donate" element={<EmbedDonorbox />} />
      </Routes>
    </BrowserRouter>
    <DonorboxPopup />
  </ThemeProvider>,
  document.getElementById('root')
)
