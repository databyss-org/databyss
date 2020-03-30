import React from 'react'
import Highlighter from 'react-highlight-words'
import { EntrySearchLoader } from '@databyss-org/services/entries/EntryProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import {
  Text,
  View,
  BaseControl,
  Grid,
  Icon,
  ScrollView,
} from '@databyss-org/ui/primitives'
import PageSvg from '@databyss-org/ui/assets/page.svg'

const SearchContent = () => {
  const { getTokensFromPath, navigate } = useNavigationContext()

  const { id } = getTokensFromPath()

  const onEntryClick = (pageId, blockId) => {
    navigate(`/pages/${pageId}#${blockId}`)
  }

  const onPageClick = pageId => {
    navigate(`/pages/${pageId}`)
  }
  /*
  use same route to update name, just pass it name 
  */

  const ComposeResults = ({ results }) => {
    const _Pages = Object.values(results).length ? (
      Object.values(results).map((r, i) => (
        <View key={i} mb="medium">
          <View height="40px">
            <BaseControl
              hoverColor="background.2"
              activeColor="background.3"
              key={`pageHeader-${i}`}
              onClick={() => onPageClick(r.pageId)}
            >
              <Grid singleRow alignItems="center" columnGap="small">
                <Icon sizeVariant="small" color="text.3">
                  <PageSvg />
                </Icon>
                <Text variant="bodyLarge">{r.page}</Text>
              </Grid>
            </BaseControl>
          </View>
          {r.entries.map((e, k) => (
            <BaseControl
              hoverColor="background.2"
              activeColor="background.3"
              key={k}
              onClick={() => onEntryClick(r.pageId, e.blockId)}
            >
              <View p="small" ml="small">
                <Text>
                  <Highlighter
                    searchWords={[id]}
                    autoEscape
                    textToHighlight={e.text}
                  />
                </Text>
              </View>
            </BaseControl>
          ))}
        </View>
      ))
    ) : (
      <Text>no results found</Text>
    )
    return <View>{_Pages}</View>
  }

  return (
    <ScrollView p="medium" flex="1" maxHeight="98vh">
      <View p="medium">
        <Text variant="bodyLarge" color="text.3">
          &quot;{id}&quot;
        </Text>
      </View>

      <EntrySearchLoader query={id}>
        {results => ComposeResults(results)}
      </EntrySearchLoader>
    </ScrollView>
  )
}

export default SearchContent
