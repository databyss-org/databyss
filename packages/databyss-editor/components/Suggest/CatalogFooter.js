import React from 'react'
import { Text } from '@databyss-org/ui/primitives'
import googleLogo from '@databyss-org/ui/assets/powered_by_google_on_white.png'
import googleLogoRetina from '@databyss-org/ui/assets/powered_by_google_on_white_2x.png'
import { GOOGLE_BOOKS, OPEN_LIBRARY } from './SuggestSources'

const footerMap = {
  [GOOGLE_BOOKS]: () => (
    <img
      srcSet={`${googleLogo}, ${googleLogoRetina} 2x`}
      src={googleLogo}
      alt="powered by Google"
      width="112"
      height="14"
    />
  ),
  [OPEN_LIBRARY]: () => <Text variant="uiTextSmall">Open Library</Text>,
}

const CatalogFooter = ({ type }) => footerMap[type]()

export default CatalogFooter
