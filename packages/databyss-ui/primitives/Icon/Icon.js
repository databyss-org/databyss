import React from 'react'
import { variant } from 'styled-system'
import css from '@styled-system/css'
import { get } from '@styled-system/core'
import { View } from '../'
import styled from '../styled'
import colors from '../../theming/colors'
import IS_NATIVE from '../../lib/isNative'

const variants = variant({
  prop: 'sizeVariant',
  scale: 'iconSizeVariants',
})

const Styled = styled(View, variants)

const Icon = ({ children, color, sizeVariant, ...others }) => {
  const webProps = {
    css: css({
      path: {
        fill: color,
      },
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
        fill: get(colors, color, 'black'),
        width: '100%',
        height: '100%',
      })}
    </Styled>
  )
}

Icon.defaultProps = {
  sizeVariant: 'medium',
  color: 'black',
}

export default Icon
