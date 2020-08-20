import React from 'react'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SourcesSvg from '@databyss-org/ui/assets/sources.svg'
import AuthorsSvg from '@databyss-org/ui/assets/authors.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicsSvg from '@databyss-org/ui/assets/topics.svg'
import { View, Icon } from '@databyss-org/ui/primitives'
import { useLocation } from '@reach/router'
import SidebarListItem from '@databyss-org/ui/components/Sidebar/SidebarListItem'

const menuSvgs = type =>
  ({
    pages: <PageSvg />,
    sources: <SourcesSvg />,
    authors: <AuthorsSvg />,
    topics: <TopicsSvg />,
  }[type])

const SidebarList = ({ menuItems, query, height }) => {
  const { getTokensFromPath } = useNavigationContext()
  const location = useLocation()
  const tokens = getTokensFromPath()

  const getHref = item => {
    if (item.params) {
      return `${item.route}${query ? '?' : '/'}${item.params}`
    }
    return `${item.route}`
  }

  return (
    <View
      width="100%"
      height={height}
      overflow="scroll"
      p={pxUnits(0)}
      mt="extraSmall"
    >
      {menuItems.map((item, index) => {
        const _isActive = item.params
          ? item.params === tokens.params
          : item.route === location.pathname

        if (item.text) {
          return (
            <SidebarListItem
              isActive={_isActive}
              text={item.text}
              href={getHref(item)}
              key={`${item.type}-${index}`}
              index={index}
              icon={
                <Icon
                  sizeVariant="tiny"
                  color={_isActive ? 'text.1' : 'text.3'}
                  mt={pxUnits(2)}
                >
                  {item.icon ? item.icon : menuSvgs(item.type)}
                </Icon>
              }
            />
          )
        }
        return null
      })}
    </View>
  )
}

export default SidebarList
