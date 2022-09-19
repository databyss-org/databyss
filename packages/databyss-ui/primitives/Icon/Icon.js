import React from 'react'
import { variant } from 'styled-system'
import $css from '@styled-system/css'
import { get } from '@styled-system/core'
import { withTheme } from 'emotion-theming'
import { View } from '../..'
import styled from '../styled'
import IS_NATIVE from '../../lib/isNative'

const variants = variant({
  prop: 'sizeVariant',
  scale: 'iconSizeVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

const Styled = styled(View, variants)

const Icon = ({
  children,
  color,
  sizeVariant,
  theme,
  useSvgColors,
  css,
  ...others
}) => {
  const webProps = useSvgColors
    ? css ?? {}
    : {
        css: $css({
          path: {
            fill: color,
          },
          ...(css ?? {}),
        }),
      }
  const nativeProps = {}

  const Svg = React.Children.only(children)
  return (
    <Styled
      sizeVariant={sizeVariant}
      justifyContent="center"
      {...(IS_NATIVE ? nativeProps : webProps)}
      {...others}
    >
      {React.cloneElement(Svg, {
        fill: get(theme.colors, color, 'black'),
        width: '100%',
        height: '100%',
      })}
    </Styled>
  )
}

Icon.defaultProps = {
  sizeVariant: 'medium',
  color: 'text.0',
}

export default withTheme(Icon)
