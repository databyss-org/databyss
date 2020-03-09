import React, { useState } from 'react'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import Databyss from '@databyss-org/ui/assets/databyss.svg'
import ArrowLeft from '@databyss-org/ui/assets/arrowLeft.svg'
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
    text: 'Databyss',
    type: 'header',
  },
  {
    type: 'pages',
    text: 'Pages',
  },
  {
    type: 'sources',
    text: 'Sources',
  },
  {
    type: 'authors',
    text: 'Authors',
  },
  {
    type: 'topics',
    text: 'Topics',
  },
]

const menuSvgs = type => {
  return {
    header: <Databyss />,
    pages: <PageSvg />,
    sources: <SourceSvg />,
    authors: <AuthorSvg />,
    topics: <TopicSvg />,
  }[type]
}

const SidebarList = ({
  menuItems = defaultMenu,
  menuItem,
  menuOpen,
  onToggleMenuOpen,
  onItemClick,
}) => {
  const onClick = (item, index) => {
    // if first item in array, item is header
    if (!index) {
      if (menuItem) {
        // clear active item
        return onItemClick(false)
      } else {
        // collapse menu
        return onToggleMenuOpen()
      }
    }
    // if no id is passed, pass the item type
    if (!item.id) {
      return onItemClick(item.type)
    }
    return onItemClick(item.id)
  }

  return menuItems.reduce((acc, item, index) => {
    if (index !== 0) {
      acc.push(<Separator color="border.1" key={`separator${index}`} />)
    }
    acc.push(
      <BaseControl
        id="menu-this"
        p={2}
        key={index}
        width="100%"
        onClick={() => onClick(item, index)}
        alignItems={!menuOpen && 'flex-end'}
      >
        {menuOpen ? (
          <View id="inside-item">
            <Grid singleRow alignItems="center" columnGap="small">
              <Icon sizeVariant={index ? 'tiny' : 'medium'} color="text.3">
                {index ? menuSvgs(item.type) : <ArrowLeft />}
              </Icon>
              <Text
                variant={index ? 'uiTextSmall' : 'uiTextLarge'}
                color="text.2"
              >
                {item.text}
              </Text>
              {index ? (
                <View position="absolute" right="small">
                  <Icon sizeVariant="small" color="text.3">
                    <ArrowRight />
                  </Icon>
                </View>
              ) : null}
            </Grid>
          </View>
        ) : (
          <Grid singleRow id="here" alignItems="flex-end" columnGap="small">
            <Icon
              sizeVariant={!index || !menuOpen ? 'medium' : 'tiny'}
              color="text.3"
            >
              {menuSvgs(item.type)}
            </Icon>
          </Grid>
        )}
      </BaseControl>
    )
    return acc
  }, [])
}

export default SidebarList
