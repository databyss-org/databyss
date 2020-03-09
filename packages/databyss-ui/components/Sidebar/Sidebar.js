import React, { useState } from 'react'
import SidebarContent from './SidebarList'
import {
  Text,
  View,
  List,
  BaseControl,
  Grid,
  Icon,
  Separator,
  TextControl,
  Button,
} from '@databyss-org/ui/primitives'
import { Viewport } from '@databyss-org/ui'
import { darkTheme } from '../../theming/theme'
import css from '@styled-system/css'

export const defaultProps = {
  height: '100vh',
  flexDirection: 'column',
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

const BottomInfoText = ({ text }) => (
  <Text color="text.3" variant="uiTextSmall" p="tiny">
    {text}
  </Text>
)

const BottomInfo = (
  <View alignItems="stretch" flexGrow={1} width="100%" p="medium">
    <View p="small">
      <BottomInfoText text="Syntax Guide" />
    </View>
    <Separator color="border.1" />
    <View p="small">
      <BottomInfoText text="@ source" />
      <BottomInfoText text="// location" />
      <BottomInfoText text="# topic" />
    </View>
    <Separator color="border.1" />
    <BaseControl width="100%" onClick={() => console.log('new page')}>
      <View p="medium" pl="small">
        <Text color="text.3" variant="uiTextSmall">
          + New Page Placeholder
        </Text>
      </View>
    </BaseControl>
  </View>
)

Section.defaultProps = {
  variant: 'heading3',
}

const Sidebar = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(true)
  const [menuItem, setMenuItem] = useState(false)

  return (
    <View alignItems="stretch" flexGrow={1} width="100%">
      <Grid columnGap="none" rowGap="none">
        <View
          {...defaultProps}
          css={css({
            transform: menuOpen ? 'translateX(0)' : 'translateX(-240px)',
            transition: 'transform 0.3s ease-in-out',
          })}
        >
          <View
            widthVariant="content"
            theme={darkTheme}
            bg="background.0"
            width={300}
            pt={'medium'}
            height="100vh"
          >
            <List
              verticalItemPadding={2}
              horizontalItemPadding={2}
              mt="none"
              mb="none"
              alignItems={menuOpen ? 'center' : 'flex-end'}
            >
              {/*
            if menuItem exists, load list of items and compose 
            */}
              {menuItem ? (
                <div>test</div>
              ) : (
                SidebarContent({ menuOpen, setMenuOpen, setMenuItem })
              )}
            </List>
            {menuOpen && (
              <View position="fixed" bottom={0} left={0} width="100%">
                {BottomInfo}
              </View>
            )}
          </View>
        </View>
        <View
          width={500}
          display="flex"
          css={css({
            transform: menuOpen ? 'translateX(0)' : 'translateX(-240px)',
            transition: 'transform 0.3s ease-in-out',
          })}
        >
          {children}
        </View>
      </Grid>
    </View>
  )
}

export default Sidebar
