import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import AuthorsSvg from '@databyss-org/ui/assets/authors.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicsSvg from '@databyss-org/ui/assets/topics.svg'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
} from '@databyss-org/ui/primitives'
import { useLocation } from '@reach/router'

const menuSvgs = type =>
  ({
    pages: <PageSvg />,
    sources: <SourcesSvg />,
    authors: <AuthorsSvg />,
    topics: <TopicsSvg />,
  }[type])

const SidebarList = ({ menuItems, query, ...others }) => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { getTokensFromPath } = useNavigationContext()
  const location = useLocation()
  const tokens = getTokensFromPath()

  const getHref = item => {
    if (item.params) {
      return `${item.route}${query ? '?' : '/'}${item.params}`
    }
    return `${item.route}`
  }

  const padding = 26
  const headerHeight = 34
  const footerHeight = 48
  const searchBar = 54

  const totalHeight = pxUnits(padding + headerHeight + footerHeight + searchBar)

  return (
    <View
      width="100%"
      height={`calc(100vh - ${totalHeight})`}
      overflow="scroll"
      p={pxUnits(0)}
      mt="extraSmall"
      {...others}
    >
      {menuItems.map((item, index) => {
        const _isActive = item.params
          ? item.params === tokens.params
          : item.route === location.pathname

        if (item.text) {
          return (
            <BaseControl
              data-test-element={`page-sidebar-${index}`}
              backgroundColor={_isActive ? 'control.1' : 'transparent'}
              py="small"
              px="em"
              key={index}
              width="100%"
              href={`/${account._id}${getHref(item)}`}
              css={{
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              <Grid singleRow flexWrap="nowrap" columnGap="small">
                <Icon
                  sizeVariant="tiny"
                  color={_isActive ? 'text.1' : 'text.3'}
                  mt={pxUnits(2)}
                >
                  {item.icon ? item.icon : menuSvgs(item.type)}
                </Icon>
                <Text
                  variant="uiTextSmall"
                  color={_isActive ? 'text.1' : 'text.3'}
                >
                  {item.text}
                </Text>
              </Grid>
            </BaseControl>
          )
        }
        return null
      })}
    </View>
  )
}

export default SidebarList
