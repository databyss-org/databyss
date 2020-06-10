import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import AuthorsSvg from '@databyss-org/ui/assets/authors.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
} from '@databyss-org/ui/primitives'

const menuSvgs = type =>
  ({
    pages: <PageSvg />,
    sources: <SourcesSvg />,
    authors: <AuthorsSvg />,
    topics: <TopicSvg />,
  }[type])

const SidebarList = ({ menuItems }) => {
  const { getTokensFromPath, navigate } = useNavigationContext()

  const tokens = getTokensFromPath()

  // dispatch id to fetch
  const onClick = item => {
    if (item.id) {
      return navigate(`/${item.type}/${item.id}`)
    }
    return navigate(`/${item.type}`)
  }

  const padding = 24
  const headerHeight = 66
  const footerHeight = 48
  const searchBar = 56

  const totalHeight = pxUnits(padding + headerHeight + footerHeight + searchBar)

  return (
    <View
      width="100%"
      height={`calc(100vh - ${totalHeight})`}
      overflow="scroll"
      p={pxUnits(0)}
      mt="extraSmall"
    >
      {menuItems.map((item, index) => {
        const _isActive = item.id
          ? item.id === tokens.id
          : item.type === tokens.type && !tokens.id

        if (item.text) {
          return (
            <BaseControl
              data-test-element={`page-sidebar-${index}`}
              backgroundColor={_isActive ? 'control.1' : 'transparent'}
              py="small"
              px="em"
              key={index}
              width="100%"
              onClick={() => onClick(item)}
            >
              <View>
                <Grid singleRow flexWrap="nowrap" columnGap="small">
                  <Icon sizeVariant="tiny" color="text.2" mt={pxUnits(2)}>
                    {item.icon ? item.icon : menuSvgs(item.type)}
                  </Icon>
                  <Text
                    variant={_isActive ? 'uiTextSmallSemibold' : 'uiTextSmall'}
                    color="text.2"
                  >
                    {item.text}
                  </Text>
                </Grid>
              </View>
            </BaseControl>
          )
        }
        return null
      })}
    </View>
  )
}

export default SidebarList
