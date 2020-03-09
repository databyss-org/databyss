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
import { Viewport } from '@databyss-org/ui'
import { darkTheme } from '../../theming/theme'
import css from '@styled-system/css'

export const defaultProps = {
  height: '100vh',
  flexDirection: 'column',
}

const Section = ({ children, title, variant, ...others }) => (
  <View mb="medium" {...others}>
    <View mb="small">
      <Text variant={variant} color="text.3">
        {title}
      </Text>
    </View>
    {children}
  </View>
)

const BottomInfoText = ({ text }) => (
  <Text color="text.3" variant="uiTextSmall" p="tiny">
    {text}
  </Text>
)

const BottomInfo = (
  <View alignItems="stretch" flexGrow={1} width="100%" p="medium">
    <View p="small">
      <BottomInfoText text="Syntax Guide" />
    </View>
    <Separator color="border.1" />
    <View p="small">
      <BottomInfoText text="@ source" />
      <BottomInfoText text="// location" />
      <BottomInfoText text="# topic" />
    </View>
    <Separator color="border.1" />
    <BaseControl width="100%" onClick={() => console.log('new page')}>
      <View p="medium" pl="small">
        <Text color="text.3" variant="uiTextSmall">
          + New Page Placeholder
        </Text>
      </View>
    </BaseControl>
  </View>
)

Section.defaultProps = {
  variant: 'heading3',
}

const Sidebar = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(true)
  const [menuItem, setMenuItem] = useState(false)

  const composeList = type => {
    console.log(type)
  }

  const menuItems = [
    {
      svg: menuOpen ? <ArrowLeft /> : <Databyss />,
      text: 'Databyss',
      action: () => setMenuOpen(!menuOpen),
    },
    {
      svg: <PageSvg />,
      text: 'Pages',
      action: () => setMenuItem('Pages'),
      list: [
        {
          svg: <ArrowLeft />,
          text: 'Pages',
          action: () => {
            setMenuItem(false)
          },
        },
        {
          svg: <PageSvg />,
          text: 'page title 1',
          action: () => console.log('dispatch id 1'),
        },
        {
          svg: <PageSvg />,
          text: 'page title 2',
          action: () => console.log('dispatch id 2'),
        },
        {
          svg: <PageSvg />,
          text: 'page title 3',
          action: () => console.log('dispatch id 3'),
        },
      ],
    },
    {
      svg: <SourceSvg />,
      text: 'Sources',
      action: () => setMenuItem('Sources'),
    },
    {
      svg: <AuthorSvg />,
      text: 'Authors',
      action: () => setMenuItem('Authors'),
    },
    {
      svg: <TopicSvg />,
      text: 'Topics',
      action: () => setMenuItem('Topics'),
    },
  ]

  const SidebarContent = list =>
    list.reduce((acc, item, index) => {
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
                  {item.svg}
                </Icon>
                <Text
                  variant={index ? 'uiTextSmall' : 'uiTextLarge'}
                  color="text.2"
                >
                  {item.text}
                </Text>
                {index && !menuItem ? (
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
                {item.svg}
              </Icon>
            </Grid>
          )}
        </BaseControl>
      )
      return acc
    }, [])

  return (
    <View alignItems="stretch" flexGrow={1} width="100%">
      <Grid columnGap="none" rowGap="none">
        <View
          {...defaultProps}
          css={css({
            transform: menuOpen ? 'translateX(0)' : 'translateX(-240px)',
            transition: 'transform 0.3s ease-in-out',
          })}
        >
          <View
            widthVariant="content"
            theme={darkTheme}
            bg="background.0"
            width={300}
            pt={'medium'}
            height="100vh"
          >
            <List
              verticalItemPadding={2}
              horizontalItemPadding={2}
              mt="none"
              mb="none"
              alignItems={menuOpen ? 'center' : 'flex-end'}
            >
              {menuItem
                ? SidebarContent(menuItems.find(i => i.text === menuItem).list)
                : SidebarContent(menuItems)}
            </List>
            {menuOpen && (
              <View position="fixed" bottom={0} left={0} width="100%">
                {BottomInfo}
              </View>
            )}
          </View>
        </View>
        <View
          width={500}
          display="flex"
          css={css({
            transform: menuOpen ? 'translateX(0)' : 'translateX(-240px)',
            transition: 'transform 0.3s ease-in-out',
          })}
        >
          {children}
        </View>
      </Grid>
    </View>
  )
}

export default Sidebar
