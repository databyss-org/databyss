/* eslint-disable no-unused-vars */
import React from 'react'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import PageSvg from '@databyss-org/ui/assets/page.svg'
import TopicSvg from '@databyss-org/ui/assets/topic.svg'
import { Text, Icon, ListControl } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { loremIpsum } from 'lorem-ipsum'
import Alea from 'alea'
import { Section } from './'

const alea = new Alea('typography')
const ipsum = () => loremIpsum({ units: 'words', count: 4, random: alea })
const longIpsums = new Array(50).fill().map(ipsum)
const shortIpsums = new Array(5).fill().map(ipsum)

export default () => (
  <React.Fragment>
    <Section title="Long List">
      <ListControl
        height={250}
        renderItem={({ item }) => <Text>{item}</Text>}
        onItemPress={({ item }) => {
          // console.log('item pressed', item)
        }}
        data={longIpsums}
        borderVariant="thinDark"
        paddingVariant="small"
      />
    </Section>
    <Section title="Short List (fixed height)">
      <ListControl
        height={200}
        renderItem={({ item }) => <Text>{item}</Text>}
        onItemPress={({ item }) => {
          // console.log('item pressed', item)
        }}
        data={shortIpsums}
        borderVariant="thinDark"
        paddingVariant="small"
        mb="medium"
      />
    </Section>
  </React.Fragment>
)

export const ItemSeparators = () => (
  <Section title="List with Separators &amp; Spacing">
    <ListControl
      renderItem={({ item }) => <Text>{item}</Text>}
      itemSeparatorWidth={1}
      itemSpacing={10}
      onItemPress={({ item }) => {
        // console.log('item pressed', item)
      }}
      data={shortIpsums}
      borderVariant="thinDark"
      paddingVariant="small"
    />
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
      <ListControl
        itemSpacing={5}
        renderItem={({ item }) => (
          <Grid
            singleRow
            paddingVariant="small"
            alignItems="center"
            columnGap="small"
          >
            <Icon sizeVariant="tiny" color="text.4">
              {item.svg}
            </Icon>
            <Text variant="uiTextSmall" color="text.3">
              {item.text}
            </Text>
          </Grid>
        )}
        itemSeparatorWidth={1}
        onItemPress={({ item }) => {
          // console.log('item pressed', item)
        }}
        data={menuItems}
      />
    </Section>
  )
}
