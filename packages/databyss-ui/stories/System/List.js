/* eslint-disable no-unused-vars */
import React, { useState, useImperativeHandle } from 'react'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import {
  Text,
  View,
  Icon,
  List,
  Separator,
  Grid,
  ScrollView,
  BaseControl,
  TextInput,
} from '@databyss-org/ui/primitives'
import { loremIpsum } from 'lorem-ipsum'
import { getNames } from 'country-list'
import Alea from 'alea'
import { Section } from './'
import { darkTheme } from '../../theming/theme'
import { withKeyboardNavigation } from '../../primitives/List/KeyboardNavigationItem'

const alea = new Alea('typography')
const ipsum = () => loremIpsum({ units: 'words', count: 4, random: alea })
const longIpsums = new Array(50).fill().map(ipsum)
const shortIpsums = new Array(5).fill().map(ipsum)

export default () => (
  <Section title="Long List">
    <ScrollView
      height={250}
      borderVariant="thinLight"
      widthVariant="content"
      backgroundColor="background.0"
    >
      <List>
        {longIpsums.map((item, index) => (
          <BaseControl key={index}>
            <Text variant="uiTextSmall">{item}</Text>
          </BaseControl>
        ))}
      </List>
    </ScrollView>
  </Section>
)

export const ItemSeparators = () => (
  <Section title="List with Separators &amp; Spacing">
    <View
      borderVariant="thinLight"
      widthVariant="content"
      backgroundColor="background.0"
    >
      <List verticalItemPadding="small">
        {shortIpsums.reduce((acc, item, index) => {
          if (index > 0) {
            acc.push(<Separator key={`separator${index}`} spacing="small" />)
          }
          acc.push(
            <BaseControl key={index}>
              <Text variant="uiTextSmall">{item}</Text>
            </BaseControl>
          )
          return acc
        }, [])}
      </List>
    </View>
  </Section>
)

export const ComplexItems = () => {
  const menuItems = [
    {
      svg: <PageSvg />,
      text: 'Pages',
    },
    {
      svg: <SourceSvg />,
      text: 'Sources',
    },
    {
      svg: <AuthorSvg />,
      text: 'Authors',
    },
    {
      svg: <TopicSvg />,
      text: 'Topics',
    },
  ]
  return (
    <Section title="List with Complex Items">
      <View
        borderVariant="thinLight"
        widthVariant="content"
        theme={darkTheme}
        bg="background.0"
      >
        <List verticalItemPadding={2} horizontalItemPadding={2} py="none">
          {menuItems.reduce((acc, item, index) => {
            if (index > 0) {
              acc.push(
                <Separator
                  spacing="none"
                  color="border.2"
                  key={`separator${index}`}
                />
              )
            }
            acc.push(
              <BaseControl key={index}>
                <Grid singleRow alignItems="center" columnGap="small">
                  <Icon sizeVariant="tiny" color="text.3">
                    {item.svg}
                  </Icon>
                  <Text variant="uiTextSmall" color="text.2">
                    {item.text}
                  </Text>
                </Grid>
              </BaseControl>
            )
            return acc
          }, [])}
        </List>
      </View>
    </Section>
  )
}

export const Sections = () => {
  const menuSections = [
    {
      title: 'Authors',
      items: [
        'Derrida, Jacques',
        'Heidegger, Martin',
        'Butler, Judith',
        'Hayles, Katherine',
      ],
    },
    {
      title: 'Publishers',
      items: [
        'Routledge',
        'University of Chicago Press',
        'Stanford University Press',
        'Johns Hopkins University Press',
      ],
    },
  ]
  return (
    <Section title="List with Sections">
      <View
        borderVariant="thinLight"
        widthVariant="content"
        backgroundColor="background.0"
      >
        <List>
          {menuSections.map((section, sectionIndex) => [
            <View
              key={section.title}
              paddingTop={sectionIndex ? 'small' : 'tiny'}
            >
              <Text variant="uiTextSmallSemibold">{section.title}</Text>
            </View>,
            ...section.items.map((item, index) => (
              <BaseControl key={index}>
                <Text variant="uiTextSmall">{item}</Text>
              </BaseControl>
            )),
          ])}
        </List>
      </View>
    </Section>
  )
}

const ListItem = ({
  children,
  activeNavigationItem,
  navigationItemRef,
  navigationItemHandle,
}) => {
  const onPress = () => {
    console.log('onpress', children)
  }

  useImperativeHandle(navigationItemHandle, () => ({
    selectNavigationItem: onPress,
  }))

  return (
    <BaseControl
      active={activeNavigationItem}
      ref={navigationItemRef}
      onPress={onPress}
    >
      <Text variant="uiTextSmall">{children}</Text>
    </BaseControl>
  )
}

const ListItemWithKeyboardNavigation = withKeyboardNavigation(ListItem)

export const KeyboardNavigationList = () => {
  const [query, setQuery] = useState({ textValue: '', ranges: [] })
  const [hasFocus, setHasFocus] = useState(false)
  return (
    <Section title="Keyboard Navigation List">
      <View bg="white" my="small">
        <TextInput
          variant="uiTextNormal"
          value={query}
          onChange={setQuery}
          onFocus={() => {
            setHasFocus(true)
            console.log('focus')
          }}
          onBlur={() => {
            setHasFocus(false)
            console.log('blur')
          }}
        />
      </View>
      <ScrollView
        height={250}
        borderVariant="thinLight"
        widthVariant="content"
        backgroundColor="background.0"
      >
        <List
          keyboardNavigation
          keyboardEventsActive={hasFocus}
          orderKey={query.textValue}
        >
          {getNames()
            .filter((s) =>
              s.toLowerCase().startsWith(query.textValue.toLowerCase())
            )
            .map((item, idx) => (
              <ListItemWithKeyboardNavigation key={idx}>
                {item}
              </ListItemWithKeyboardNavigation>
            ))}
        </List>
      </ScrollView>
    </Section>
  )
}
