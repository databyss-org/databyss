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

  /*
    todo: gets two different search queries
  */
  const { id } = getTokensFromPath()

  const onEntryClick = (pageId, blockId) => {
    navigate(`/pages/${pageId}#${blockId}`)
  }
  /*
  use same route to update name, just pass it name 
  */

  const ComposeResults = ({ results }) => {
    const _Pages = Object.values(results).map((r, i) => (
      <View key={i} mb="medium">
        <View height="40px">
          <Grid singleRow alignItems="center" columnGap="small">
            <Icon sizeVariant="small" color="text.3">
              <PageSvg />
            </Icon>
            <Text variant="bodyLarge">{r.page}</Text>
          </Grid>
        </View>
        {r.entries.map((e, k) => {
          return (
            <BaseControl
              key={k}
              onClick={() => onEntryClick(r.pageId, e.blockId)}
            >
              <View p="small" ml="small">
                <Text>
                  <Highlighter
                    searchWords={[id]}
                    autoEscape={true}
                    textToHighlight={e.text}
                  />
                </Text>
              </View>
            </BaseControl>
          )
        })}
      </View>
    ))
    return <View>{_Pages}</View>
  }

  return (
    <ScrollView p="medium" flex="1" maxHeight="98vh">
      <View p="medium">
        <Text variant="bodyLarge" color="text.3">
          "{id}"
        </Text>
      </View>

      <EntrySearchLoader query={id}>
        {results => {
          return ComposeResults(results)
        }}
      </EntrySearchLoader>
    </ScrollView>
  )
}

export default SearchContent
