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
import Plus from '@databyss-org/ui/assets/plus.svg'
import Databyss from '@databyss-org/ui/assets/databyss.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import SearchSvg from '@databyss-org/ui/assets/search.svg'
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
    setMenuOpen(!isMenuOpen)
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
            onClick={() => setMenuOpen(!isMenuOpen)}
            alignItems="center"
          >
            <Grid singleRow alignItems="flex-end" columnGap="small">
              <Icon sizeVariant="small" color="text.3">
                <Databyss />
              </Icon>
            </Grid>
          </BaseControl>
          {/* content */}
          <Separator color="border.1" />
          <BaseControl
            p={2}
            width="100%"
            onClick={() => onItemClick('search')}
            alignItems="center"
          >
            <Grid singleRow alignItems="center" columnGap="small">
              <Icon sizeVariant="small" color="text.3">
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
              <Icon sizeVariant="small" color="text.3">
                <PageSvg />
              </Icon>
            </Grid>
          </BaseControl>
        </List>
        <View position="fixed" bottom={0} left={0} width="60px">
          <BaseControl
            p={2}
            width="100%"
            onClick={() => onNewPageClick()}
            alignItems="center"
          >
            <Grid singleRow alignItems="center" columnGap="small">
              <Icon sizeVariant="medium" color="text.3">
                <Plus />
              </Icon>
            </Grid>
          </BaseControl>
        </View>
      </View>
    </View>
  )
}

export default SidebarCollapsed
