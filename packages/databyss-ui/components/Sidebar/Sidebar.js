import React, { useState } from 'react'
import { PagesLoader } from '@databyss-org/ui/components/Loaders'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { newPage } from '@databyss-org/services/pages/_helpers'
import SidebarList from './SidebarList'
import {
  Text,
  View,
  List,
  BaseControl,
  Grid,
  Icon,
  Separator,
} from '@databyss-org/ui/primitives'
import ArrowLeft from '@databyss-org/ui/assets/arrowLeft.svg'
import Databyss from '@databyss-org/ui/assets/databyss.svg'
import css from '@styled-system/css'

import { darkTheme } from '../../theming/theme'

export const defaultProps = {
  height: '100vh',
}

const headerMap = type => {
  if (type) {
    return { pages: 'Pages' }[type]
  }
  return 'Databyss'
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

const BottomInfo = () => {
  const { path, navigate } = useNavigationContext()
  const { setPage } = usePageContext()
  const onNewPageClick = () => {
    const _page = newPage()
    setPage(_page)
    navigate(`/pages/${_page.page._id}`)
  }

  return (
    <View
      alignItems="stretch"
      flexGrow={1}
      width="100%"
      p="medium"
      id="bottomInfo"
    >
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
      <BaseControl width="100%" onClick={onNewPageClick}>
        <View p="medium" pl="small">
          <Text color="text.3" variant="uiTextSmall">
            + New Page Placeholder
          </Text>
        </View>
      </BaseControl>
    </View>
  )
}

Section.defaultProps = {
  variant: 'heading3',
}

const Sidebar = () => {
  const { path, navigate } = useNavigationContext()
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
                console.log('here')
                navigate(`/pages/${id}`)
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

  const onHeaderClick = () => {
    if (menuItem) {
      return setMenuItem(false)
    }
    return toggleMenuOpen(!menuOpen)
  }

  return (
    <View
      {...defaultProps}
      css={css({
        width: menuOpen ? '300px' : '60px',
      })}
    >
      <View
        widthVariant="content"
        theme={darkTheme}
        bg="background.0"
        pt={'medium'}
        height="100vh"
      >
        <List
          verticalItemPadding={2}
          horizontalItemPadding={2}
          mt="none"
          mb="none"
          p="small"
          alignItems={menuOpen ? 'center' : 'flex-end'}
        >
          {/* header */}
          <BaseControl
            id="menu-this"
            p={2}
            width="100%"
            onClick={() => onHeaderClick()}
            alignItems={!menuOpen && 'center'}
          >
            {menuOpen ? (
              <View id="inside-item">
                <Grid
                  singleRow
                  alignItems="center"
                  columnGap="small"
                  id="thisicon"
                >
                  <Icon sizeVariant={'medium'} color="text.3">
                    <ArrowLeft />
                  </Icon>
                  <Text variant={'uiTextLarge'} color="text.2">
                    {headerMap(menuItem)}
                  </Text>
                </Grid>
              </View>
            ) : (
              <Grid singleRow id="here" alignItems="flex-end" columnGap="small">
                <Icon
                  sizeVariant={!menuOpen ? 'medium' : 'tiny'}
                  color="text.3"
                >
                  <Databyss />
                </Icon>
              </Grid>
            )}
          </BaseControl>
          <SidebarContent />
        </List>
        {menuOpen && (
          <View position="fixed" bottom={0} left={0} width="300px">
            <BottomInfo />
          </View>
        )}
      </View>
    </View>
  )
}

export default Sidebar
