import React from 'react'

import {
  BaseControl,
  Grid,
  Icon,
  Text,
  pxUnits,
} from '@databyss-org/ui/primitives'
import { isMobile } from '@databyss-org/ui/lib/mediaQuery'
import colors from '@databyss-org/ui/theming/colors'

/*
interface Props {
  href: string
  icon: svg
  isActive?: boolean
  label: string
}
*/

// component
const IconControl = (props) => {
  const { isActive, icon, label, href } = props

  const getCSS = () =>
    isMobile()
      ? {
          textDecoration: 'none',
          boxSizing: 'border-box',
          borderBottom: `1px solid ${colors.gray[6]}`,
        }
      : {
          textDecoration: 'none',
          boxSizing: 'border-box',
        }

  const getPaddingX = () => (isMobile() ? 'medium' : 'em')

  const getPaddingY = () => (isMobile() ? 'em' : 'small')

  const getBGColor = () => (isActive ? 'control.1' : 'transparent')

  const getColor = () => {
    if (isMobile()) {
      return colors.gray[3]
    }
    return isActive ? 'text.1' : 'text.3'
  }

  // render methods
  const render = () => (
    <BaseControl
      backgroundColor={getBGColor()}
      css={getCSS()}
      href={href}
      px={getPaddingX()}
      py={getPaddingY()}
      width="100%"
    >
      <Grid singleRow flexWrap="nowrap" columnGap="small">
        <Icon sizeVariant="tiny" color={getColor()} mt={pxUnits(2)}>
          {icon}
        </Icon>
        <Text variant="uiTextSmall" color={getColor()}>
          {label}
        </Text>
      </Grid>
    </BaseControl>
  )

  return render()
}

export default IconControl
