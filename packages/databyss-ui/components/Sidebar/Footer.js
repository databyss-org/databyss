import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { newPage } from '@databyss-org/services/pages/_helpers'
import AddPageSvg from '@databyss-org/ui/assets/add_page.svg'
import {
  Text,
  View,
  BaseControl,
  Separator,
  Icon,
  Grid,
} from '@databyss-org/ui/primitives'
import { sidebarWidth } from '@databyss-org/ui/modules/Sidebar/Sidebar'
import { sidebarCollapsedWidth } from '@databyss-org/ui/modules/Sidebar/SidebarCollapsed'

const Footer = () => {
  const { navigate, navigateSidebar, isMenuOpen } = useNavigationContext()
  const { setPage } = usePageContext()
  const onNewPageClick = () => {
    const _page = newPage()
    setPage(_page)
    navigate(`/pages/${_page.page._id}`)
    navigateSidebar('/pages')
  }

  return (
    <View
      position="absolute"
      bottom={0}
      left={0}
      width={
        isMenuOpen
          ? sidebarWidth + sidebarCollapsedWidth
          : sidebarCollapsedWidth
      }
      zIndex={1}
    >
      <Separator color="border.1" />
      <BaseControl
        px="small"
        py="extraSmall"
        width="100%"
        onClick={() => onNewPageClick()}
        flexDirection="row"
        hoverColor="#8a81754d"
      >
        <Grid singleRow alignItems="center" columnGap="small">
          <View p="extraSmall">
            <Icon sizeVariant="medium" color="text.2">
              <AddPageSvg />
            </Icon>
          </View>
          {isMenuOpen && (
            <Text variant="uiTextNormal" color="text.2" ml="em">
              New Page
            </Text>
          )}
        </Grid>
      </BaseControl>
    </View>
  )
}

export default Footer
