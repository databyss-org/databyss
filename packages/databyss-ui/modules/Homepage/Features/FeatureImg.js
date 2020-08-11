import React from 'react'
import { borderRadius } from '@databyss-org/ui/theming/views'
import theme from '@databyss-org/ui/theming/theme'

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
          alignSelf: 'center',
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
