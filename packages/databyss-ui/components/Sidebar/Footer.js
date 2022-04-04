import React from 'react'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import AddPageSvg from '@databyss-org/ui/assets/add_page.svg'
import AddGroupSvg from '@databyss-org/ui/assets/add_group.svg'
import {
  Text,
  View,
  BaseControl,
  Separator,
  Icon,
  Grid,
} from '@databyss-org/ui/primitives'
import { sidebar } from '@databyss-org/ui/theming/components'
import { Page, Group } from '@databyss-org/services/interfaces'
import { savePage } from '@databyss-org/services/editorPage'
import { saveGroup, UNTITLED_NAME } from '@databyss-org/services/groups'

const Footer = ({ collapsed }) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const { navigate, navigateSidebar, getSidebarPath } = useNavigationContext()

  const sidebarPath = getSidebarPath()

  const onNewPageClick = () => {
    if (sidebarPath === 'groups') {
      const _group = new Group(UNTITLED_NAME)
      saveGroup(_group).then(() => navigate(`/collections/${_group._id}`))
      return
    }

    const _page = new Page()
    savePage(_page).then(() => navigate(`/pages/${_page._id}`))

    navigateSidebar('/pages')
  }

  let create = {
    icon: <AddPageSvg />,
    tip: 'New Page',
    text: 'New Page',
  }
  if (sidebarPath === 'groups') {
    create = {
      icon: <AddGroupSvg />,
      tip: 'New Collection',
      text: 'New Collection',
    }
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
        disabled={isReadOnly}
      >
        <Grid singleRow alignItems="center" columnGap="small">
          {collapsed ? (
            <View p="extraSmall">
              <Icon sizeVariant="medium" color="text.2" title={create.tip}>
                {create.icon}
              </Icon>
            </View>
          ) : (
            <View
              flexDirection="row"
              justifyContent="space-between"
              flexGrow="1"
            >
              <Text variant="uiTextNormal" color="text.2" ml="small">
                {create.text}
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
