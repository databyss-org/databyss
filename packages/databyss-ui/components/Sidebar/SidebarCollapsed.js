import React from 'react'
import css from '@styled-system/css'
import {
  Text,
  View,
  List,
  BaseControl,
  Grid,
  Icon,
  Separator,
} from '@databyss-org/ui/primitives'
import Databyss from '@databyss-org/ui/assets/databyss.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import { darkTheme } from '../../theming/theme'

export const defaultProps = {
  height: '100vh',
}

const Section = ({ children, title, variant, ...others }) => (
  <View mb="medium" {...others}>
    <View mb="small">
      <Text variant={variant} color="text.3">
        {title}
      </Text>
    </View>
    {children}
  </View>
)

Section.defaultProps = {
  variant: 'heading3',
}

const SidebarCollapsed = ({ onToggleMenuOpen, setMenuItem }) => {
  const onItemClick = item => {
    setMenuItem(item)
    onToggleMenuOpen()
  }

  return (
    <View
      {...defaultProps}
      css={css({
        width: '60px',
      })}
    >
      <View
        widthVariant="content"
        theme={darkTheme}
        bg="background.0"
        pt="medium"
        height="100vh"
      >
        <List
          verticalItemPadding={2}
          horizontalItemPadding={2}
          mt="none"
          mb="none"
          p="small"
        >
          {/* header */}
          <BaseControl
            p={2}
            width="100%"
            onClick={() => onToggleMenuOpen()}
            alignItems={'center'}
          >
            <Grid singleRow alignItems="flex-end" columnGap="small">
              <Icon sizeVariant={'medium'} color="text.3">
                <Databyss />
              </Icon>
            </Grid>
          </BaseControl>
          {/* content */}
          <Separator color="border.1" />
          <BaseControl
            p={2}
            width="100%"
            onClick={() => onItemClick('pages')}
            alignItems={'center'}
          >
            <Grid singleRow alignItems="center" columnGap="small">
              <Icon sizeVariant={'medium'} color="text.3">
                <PageSvg />
              </Icon>
            </Grid>
          </BaseControl>
        </List>
      </View>
    </View>
  )
}

export default SidebarCollapsed
