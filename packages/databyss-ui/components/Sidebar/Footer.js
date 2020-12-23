import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
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
import {
  initNewPage,
  PageConstructor,
} from '@databyss-org/services/database/pages/util'

const Footer = ({ collapsed }) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const { navigate, navigateSidebar } = useNavigationContext()

  const clearSearchCache = useEntryContext((c) => c && c.clearSearchCache)

  const setPage = usePageContext((c) => c.setPage)

  const onNewPageClick = () => {
    // clears search cache
    clearSearchCache()
    const _page = new PageConstructor()

    _page.addPage().then(() => {
      navigate(`/pages/${_page._id}`)
    })

    navigateSidebar('/pages')
  }

  return !isPublicAccount() ? (
    <>
      <Separator color="border.1" spacing="none" />
      <BaseControl
        px="small"
        py="extraSmall"
        width="100%"
        height={sidebar.footerHeight}
        m="none"
        data-test-element="new-page-button"
        onClick={() => onNewPageClick()}
        flexDirection="row"
        alignItems="center"
        childViewProps={{ width: '100%' }}
      >
        <Grid singleRow alignItems="center" columnGap="small">
          {collapsed ? (
            <View p="extraSmall">
              <Icon sizeVariant="medium" color="text.2">
                <AddPageSvg />
              </Icon>
            </View>
          ) : (
            <View
              flexDirection="row"
              justifyContent="space-between"
              flexGrow="1"
            >
              <Text variant="uiTextNormal" color="text.2" ml="small">
                New Page
              </Text>
              {/* 
              TODO: Only show this in electron app, when we get it, because we don't want
                to override the standard browser hotkeys. Also make the modifier key
                appropriate to the OS
              <Text variant="uiTextNormal" color="text.3" mr="small">
                ⌘+N
              </Text> */}
            </View>
          )}
        </Grid>
      </BaseControl>
    </>
  ) : null
}

export default Footer
