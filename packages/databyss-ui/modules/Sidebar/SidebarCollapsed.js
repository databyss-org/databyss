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
import { newPage } from '@databyss-org/services/pages/_helpers'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import AddPageSvg from '@databyss-org/ui/assets/add_page.svg'
import PagesSvg from '@databyss-org/ui/assets/pages.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
import MenuCollapseSvg from '@databyss-org/ui/assets/menu_collapse.svg'
import MenuSvg from '@databyss-org/ui/assets/menu.svg'
import { pxUnits } from '@databyss-org/ui/theming/views'
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

const SidebarCollapsed = () => {
  const {
    navigate,
    navigateSidebar,
    isMenuOpen,
    setMenuOpen,
  } = useNavigationContext()
  const { setPage } = usePageContext()
  const onNewPageClick = () => {
    const _page = newPage()
    setPage(_page)
    navigate(`/pages/${_page.page._id}`)
  }

  const onItemClick = item => {
    navigateSidebar(`/${item}`)
  }

  return (
    <View
      {...defaultProps}
      widthVariant="content"
      theme={darkTheme}
      bg="background.0"
      // pt="medium"
      height="100vh"
      borderRightColor="border.1"
      borderRightWidth={pxUnits(1)}
      css={css({
        width: '56px',
      })}
    >
      <List
        verticalItemPadding={2}
        horizontalItemPadding={1}
        mt="none"
        mb="none"
        p="extraSmall"
      >
        {/* header */}
        <BaseControl
          p={2}
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
          p={2}
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
          p={2}
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
      <View position="fixed" bottom={0} left={0} width="56px">
        <BaseControl
          p={2}
          width="100%"
          onClick={() => onNewPageClick()}
          alignItems="center"
        >
          <Grid singleRow alignItems="center" columnGap="small">
            <Icon sizeVariant="medium" color="text.3">
              <AddPageSvg />
            </Icon>
          </Grid>
        </BaseControl>
      </View>
    </View>
  )
}

export default SidebarCollapsed
