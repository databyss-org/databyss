import React from 'react'
import css from '@styled-system/css'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import Databyss from '@databyss-org/ui/assets/databyss.svg'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
  Separator,
} from '@databyss-org/ui/primitives'

const defaultMenu = [
  {
    type: 'pages',
    text: 'Pages',
  },
  // {
  //   type: 'sources',
  //   text: 'Sources',
  // },
  //   {
  //     type: 'authors',
  //     text: 'Authors',
  //   },
  //   {
  //     type: 'topics',
  //     text: 'Topics',
  //   },
]

const menuSvgs = type =>
  ({
    header: <Databyss />,
    pages: <PageSvg />,
    sources: <SourceSvg />,
    authors: <AuthorSvg />,
    topics: <TopicSvg />,
  }[type])

const SidebarList = ({ menuItems = defaultMenu }) => {
  const {
    getTokensFromPath,
    navigateSidebar,
    navigate,
  } = useNavigationContext()

  const tokens = getTokensFromPath()

  const onClick = item => {
    if (!item.id) {
      return navigateSidebar(`/${item.type}`)
    }
    // dispatch id to fetch
    return navigate(`/pages/${item.id}`)
  }

  const padding = 24
  const headerHeight = 66
  const footerHeight = 48
  const searchBar = 56

  const totalHeight = pxUnits(padding + headerHeight + footerHeight + searchBar)

  return (
    <View
      width="100%"
      css={css({
        height: `calc(100vh - ${totalHeight})`,
      })}
      overflow="scroll"
      p={pxUnits(0)}
    >
      {menuItems.reduce((acc, item, index) => {
        const _isActive = item.id === tokens.id && tokens.id
        acc.push(
          <BaseControl
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
                  {menuSvgs(item.type)}
                </Icon>
                <Text variant="uiTextSmall" color="text.2">
                  {item.text}
                </Text>
              </Grid>
            </View>
          </BaseControl>
        )

        return acc
      }, [])}
    </View>
  )
}

export default SidebarList
