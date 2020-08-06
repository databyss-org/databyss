import React from 'react'
import { borderRadius } from '@databyss-org/ui/theming/views'
import theme from '@databyss-org/ui/theming/theme'

const FeatureImg = ({ imgSrc, imgAlt, svgImg }) => (
  <>
    {imgSrc && (
      <img
        src={imgSrc}
        alt={imgAlt}
        css={{
          alignSelf: 'flex-start',
          boxShadow: theme.buttonShadow.boxShadow,
          borderRadius,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
    )}
    {svgImg && svgImg}
  </>
)

export default FeatureImg
