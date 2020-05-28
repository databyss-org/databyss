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
  const { navigateSidebar, isMenuOpen, setMenuOpen } = useNavigationContext()

  const onItemClick = item => {
    navigateSidebar(`/${item}`)
  }

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
        <BaseControl
          width="100%"
          onClick={() => setMenuOpen(!isMenuOpen)}
          alignItems="center"
        >
          <Grid singleRow alignItems="flex-end" columnGap="small">
            <Icon sizeVariant="medium" color="text.3">
              {isMenuOpen ? <MenuCollapseSvg /> : <MenuSvg />}
            </Icon>
          </Grid>
        </BaseControl>
        <BaseControl
          width="100%"
          onClick={() => onItemClick('search')}
          alignItems="center"
        >
          <Grid singleRow alignItems="center" columnGap="small">
            <Icon sizeVariant="medium" color="text.3">
              <SearchSvg />
            </Icon>
          </Grid>
        </BaseControl>
        <BaseControl
          width="100%"
          onClick={() => onItemClick('pages')}
          alignItems="center"
        >
          <Grid singleRow alignItems="center" columnGap="small">
            <Icon sizeVariant="medium" color="text.3">
              <PagesSvg />
            </Icon>
          </Grid>
        </BaseControl>
      </List>
      <Footer />
    </View>
  )
}

export default SidebarCollapsed
