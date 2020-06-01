import React from 'react'
import css from '@styled-system/css'
import {
  Text,
  View,
  List,
  BaseControl,
  Grid,
  Icon,
} from '@databyss-org/ui/primitives'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import PagesSvg from '@databyss-org/ui/assets/pages.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import MenuCollapseSvg from '@databyss-org/ui/assets/menu_collapse.svg'
import MenuSvg from '@databyss-org/ui/assets/menu.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
import { darkTheme } from '../../theming/theme'
import Footer from '../../components/Sidebar/Footer'

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

export const sidebarCollapsedWidth = 56

const SidebarCollapsed = () => {
  const {
    navigateSidebar,
    getSidebarPath,
    isMenuOpen,
    setMenuOpen,
  } = useNavigationContext()

  const onItemClick = item => {
    navigateSidebar(`/${item}`)
  }

  const isActiveItem = item => getSidebarPath() === item

  const sideBarCollapsedItems = [
    {
      name: 'menuCollapse',
      icon: isMenuOpen ? <MenuCollapseSvg /> : <MenuSvg />,
      onClick: () => setMenuOpen(!isMenuOpen),
    },
    {
      name: 'search',
      icon: <SearchSvg />,
      onClick: () => onItemClick('search'),
    },
    {
      name: 'pages',
      icon: <PagesSvg />,
      onClick: () => onItemClick('pages'),
    },
  ]

  return (
    <View
      {...defaultProps}
      widthVariant="content"
      theme={darkTheme}
      bg="background.1"
      height="100vh"
      borderRightColor="border.1"
      borderRightWidth={pxUnits(1)}
      css={css({
        width: sidebarCollapsedWidth,
      })}
    >
      <List verticalItemPadding={2} horizontalItemPadding={1} m="none">
        {sideBarCollapsedItems.map(item => (
          <BaseControl
            key={item.name}
            width="100%"
            onClick={item.onClick}
            alignItems="center"
            borderWidth="3px"
            borderLeftColor={
              isActiveItem(item.name) ? 'purple.1' : 'transparent'
            }
          >
            <Grid singleRow alignItems="center" columnGap="small">
              <Icon sizeVariant="medium" color="text.3">
                {item.icon}
              </Icon>
            </Grid>
          </BaseControl>
        ))}
      </List>
      <Footer />
    </View>
  )
}

export default SidebarCollapsed
