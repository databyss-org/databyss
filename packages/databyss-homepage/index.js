import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@databyss-org/ui/theming'
import theme, { darkTheme, pxUnits } from '@databyss-org/ui/theming/theme'
import { Page } from './components/Page'
import homepageContent from './content/homepageContent.json'
import foundationContent from './content/foundationContent.json'
// import { EmbedDonorbox, DonorboxPopup } from './components/Donorbox'

const globalStyles = () => ({
  '& a, & a:visited': {
    color: 'inherit',
  },
  '& .featured a, & .featured a:visited': {
    color: '#B6B6FB',
  },
})

ReactDOM.render(
  <ThemeProvider globalStyles={globalStyles}>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Page content={homepageContent} theme={darkTheme} />}
        />
        <Route
          path="/foundation"
          element={
            <Page
              content={foundationContent}
              theme={theme}
              props2k={{
                widthVariant: 'widePage',
                alignSelf: 'center',
                justifySelf: 'center',
              }}
              css={{
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
              }}
            />
          }
        />
        {/* <Route path="/donate" element={<EmbedDonorbox />} /> */}
      </Routes>
    </BrowserRouter>
    {/* <DonorboxPopup /> */}
  </ThemeProvider>,
  document.getElementById('root')
)
