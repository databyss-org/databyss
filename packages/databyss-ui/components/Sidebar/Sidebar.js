import React, { useState, useEffect } from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import SidebarList from './SidebarList'
import {
  Text,
  View,
  List,
  BaseControl,
  Grid,
  Separator,
} from '@databyss-org/ui/primitives'
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
  const [menuOpen, toggleMenuOpen] = useState(true)
  const [menuItem, setMenuItem] = useState(false)

  const onToggleMenuOpen = () => {
    toggleMenuOpen(!menuOpen)
  }

  /*
  if item active in menuItem, SidebarContent will compose a list to pass to SidebarList
  */

  const SidebarContent = () => {
    if (menuItem === 'pages') {
      return (
        <PagesLoader>
          {pages => {
            const _menuItems = Object.values(pages).map(p => ({
              text: p.name,
              type: 'pages',
              id: p._id,
            }))
            // first item in array should be title
            _menuItems.unshift({ text: 'Pages', type: 'header' })
            return SidebarList({
              menuItems: _menuItems,
              menuItem,
              menuOpen,
              onToggleMenuOpen,
              onItemClick: id => {
                // if no id is passed, menu will go back to default content
                if (!id) {
                  return setMenuItem(false)
                }
                console.log('DISPATCH PAGE ID', id)
                // dispatch page getter
                return
              },
            })
          }}
        </PagesLoader>
      )
    }
    return SidebarList({
      menuOpen,
      menuItem,
      onToggleMenuOpen,
      onItemClick: setMenuItem,
    })
  }

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
              <SidebarContent />
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
