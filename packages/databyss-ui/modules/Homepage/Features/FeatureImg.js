import React from 'react'
import { borderRadius } from '@databyss-org/ui/theming/views'
import theme from '@databyss-org/ui/theming/theme'
import Feature from './Feature'

const FeatureImg = ({
  imgSrc,
  imgAlt,
  maxHeight,
  width,
  height,
  imgHasBoxShadow,
}) => (
  <>
    {imgSrc && (
      <img
        src={imgSrc}
        alt={imgAlt}
        width={width}
        height={height}
        css={{
          alignSelf: 'flex-start',
          boxShadow: imgHasBoxShadow && theme.buttonShadow.boxShadow,
          borderRadius,
          maxWidth: '100%',
          maxHeight: maxHeight || '100%',
        }}
      />
    )}
  </>
)

FeatureImg.defaultProps = {
  height: 'auto',
}

export default FeatureImg
