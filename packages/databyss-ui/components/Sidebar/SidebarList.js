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
  List,
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

const SidebarContent = ({
  menuItems = defaultMenu,
  menuItem,
  menuOpen,
  onToggleMenuOpen,
  onItemClick,
}) => {
  const menuSvgs = type => {
    return {
      header: menuOpen ? <ArrowLeft /> : <Databyss />,
      pages: <PageSvg />,
      sources: <SourceSvg />,
      authors: <AuthorSvg />,
      topics: <TopicSvg />,
    }[type]
  }

  const onClick = (item, index) => {
    if (!index) {
      if (menuItems) {
        return onItemClick(false)
      } else {
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
                {menuSvgs(item.type)}
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

export default SidebarContent
