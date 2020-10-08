import React from 'react'

import {
  CROSSREF,
  GOOGLE_BOOKS,
  OPEN_LIBRARY,
} from '@databyss-org/services/catalog/constants'
import { Text } from '@databyss-org/ui/primitives'
import googleLogo from '@databyss-org/ui/assets/powered_by_google_on_white.png'
import googleLogoRetina from '@databyss-org/ui/assets/powered_by_google_on_white_2x.png'

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
  [CROSSREF]: () => <Text variant="uiTextSmall">Crossref</Text>,
}

const CatalogFooter = ({ type }) => footerMap[type]()

export default CatalogFooter
