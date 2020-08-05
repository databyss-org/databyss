import React from 'react'
import { borderRadius } from '@databyss-org/ui/theming/views'
import theme from '@databyss-org/ui/theming/theme'

const FeatureImg = ({ imgSrc, imgAlt, svgImg }) => (
  <>
    {imgSrc && (
      <img
        src={imgSrc}
        alt={imgAlt}
        width="100%"
        css={{
          alignSelf: 'flex-start',
          boxShadow: theme.buttonShadow.boxShadow,
          borderRadius,
        }}
      />
    )}
    {svgImg && svgImg}
  </>
)

export default FeatureImg
