import React from 'react'
import css from '@styled-system/css'
import { pxUnits } from '@databyss-org/ui/theming/views'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import Databyss from '@databyss-org/ui/assets/databyss.svg'
import ArrowRight from '@databyss-org/ui/assets/arrowRight.svg'
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

const SidebarList = ({
  menuItems = defaultMenu,
  //  menuItem,
  menuOpen,
  // onToggleMenuOpen,
  onItemClick,
}) => {
  const onClick = item => {
    // if no id is passed, pass the item type
    if (!item.id) {
      return onItemClick(item.type)
    }
    // dispatch id to fetch
    return onItemClick(item.id)
  }

  const padding = 24
  const headerHeight = 66
  const footerHeight = 236

  const totalHeight = pxUnits(padding + headerHeight + footerHeight)

  return (
    <View
      width="100%"
      css={css({
        height: `calc(100vh - ${totalHeight})`,
      })}
      overflow="scroll"
      id="sidebarlist"
      p={pxUnits(0)}
    >
      {menuItems.reduce((acc, item, index) => {
        acc.push(<Separator color="border.1" key={`separator-top${index}`} />)

        acc.push(
          <BaseControl
            id="menu-this"
            p={2}
            key={index}
            width="100%"
            onClick={() => onClick(item)}
            alignItems={!menuOpen && 'center'}
          >
            {menuOpen ? (
              <View id="inside-item">
                <Grid
                  singleRow
                  alignItems="center"
                  columnGap="small"
                  id="thisicon"
                >
                  <Icon sizeVariant="tiny" color="text.3">
                    {menuSvgs(item.type)}
                  </Icon>
                  <Text variant="uiTextSmall" color="text.2">
                    {item.text}
                  </Text>

                  <View position="absolute" right="small">
                    <Icon sizeVariant="small" color="text.3">
                      <ArrowRight />
                    </Icon>
                  </View>
                </Grid>
              </View>
            ) : (
              <Grid singleRow id="here" alignItems="flex-end" columnGap="small">
                <Icon
                  sizeVariant={!menuOpen ? 'medium' : 'tiny'}
                  color="text.3"
                >
                  {menuSvgs(item.type)}
                </Icon>
              </Grid>
            )}
          </BaseControl>
        )

        if (menuItems.length === index + 1) {
          acc.push(
            <Separator color="border.1" key={`separator-bottom${index}`} />
          )
        }
        return acc
      }, [])}
    </View>
  )
}

export default SidebarList
