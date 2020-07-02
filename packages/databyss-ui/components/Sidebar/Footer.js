import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { newPage } from '@databyss-org/services/pages/util'
import AddPageSvg from '@databyss-org/ui/assets/add_page.svg'
import {
  Text,
  View,
  BaseControl,
  Separator,
  Icon,
  Grid,
} from '@databyss-org/ui/primitives'
import { sidebar } from '@databyss-org/ui/theming/components'

const Footer = () => {
  const { navigate, navigateSidebar, isMenuOpen } = useNavigationContext()
  const { clearSearchCache } = useEntryContext()

  const setPage = usePageContext(c => c.setPage)

  const onNewPageClick = () => {
    // clears search cache
    clearSearchCache()
    const _page = newPage()
    setPage(_page).then(() => {
      navigate(`/pages/${_page._id}`)
    })

    navigateSidebar('/pages')
  }

  return (
    <View
      position="absolute"
      bottom={0}
      left={0}
      width={
        isMenuOpen
          ? sidebar.width + sidebar.collapsedWidth
          : sidebar.collapsedWidth
      }
      zIndex="base"
    >
      <Separator color="border.1" />
      <BaseControl
        px="small"
        py="extraSmall"
        width="100%"
        data-test-element="new-page-button"
        onClick={() => onNewPageClick()}
        flexDirection="row"
        childViewProps={{ width: '100%' }}
      >
        <Grid singleRow alignItems="center" columnGap="small">
          <View p="extraSmall">
            <Icon sizeVariant="medium" color="text.2">
              <AddPageSvg />
            </Icon>
          </View>
          {isMenuOpen && (
            <View
              flexDirection="row"
              justifyContent="space-between"
              flexGrow="1"
            >
              <Text variant="uiTextNormal" color="text.2" ml="em">
                New Page
              </Text>
              <Text variant="uiTextNormal" color="text.3" mr="small">
                ⌘+N
              </Text>
            </View>
          )}
        </Grid>
      </BaseControl>
    </View>
  )
}

export default Footer
