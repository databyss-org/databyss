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
  TextControl,
  Button,
} from '@databyss-org/ui/primitives'
import { darkTheme } from '../../theming/theme'
import css from '@styled-system/css'

const composeList = type => {
  console.log(type)
  const _list = [
    {
      text: 'Pages',
      type: 'pages',
      action: () => {
        setMenuItem(false)
      },
    },
  ]
  return SidebarContent(_list)
  /*
      {
          type
          text: 'page title 1',
          action: () => console.log('dispatch id 1'),
        },
    */
}

const SidebarContent = ({ menuOpen, setMenuOpen, setMenuItem }) => {
  const menuSvgs = type => {
    return {
      header: menuOpen ? <ArrowLeft /> : <Databyss />,
      pages: <PageSvg />,
      sources: <SourceSvg />,
      authors: <AuthorSvg />,
      topics: <TopicSvg />,
    }[type]
  }

  const menuItems = [
    {
      text: 'Databyss',
      type: 'header',
      action: () => setMenuOpen(!menuOpen),
    },
    {
      type: 'pages',
      text: 'Pages',
      action: () => setMenuItem('pages'),
    },
    {
      type: 'sources',
      text: 'Sources',
      action: () => setMenuItem('sources'),
    },
    {
      type: 'authors',
      text: 'Authors',
      action: () => setMenuItem('authors'),
    },
    {
      type: 'topics',
      text: 'Topics',
      action: () => setMenuItem('topics'),
    },
  ]

  return menuItems.reduce((acc, item, index) => {
    if (index !== 0) {
      acc.push(<Separator color="border.1" key={`separator${index}`} />)
    }
    acc.push(
      <BaseControl
        key={index}
        width="100%"
        onClick={item.action}
        alignItems={!menuOpen && 'flex-end'}
      >
        {menuOpen ? (
          <View>
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
