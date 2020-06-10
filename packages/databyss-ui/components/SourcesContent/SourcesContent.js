import React, { useEffect, useMemo } from 'react'
import Highlighter from 'react-highlight-words'
import { useParams, Router } from '@reach/router'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
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
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'

export const SourcesRouter = () => (
  <Router>
    <SourcesContent path="/" />
  </Router>
)

const SourcesContent = () => {
  const { navigate } = useNavigationContext()
  const { getPage } = usePageContext()
  const { getAllSources, state } = useSourceContext()

  useEffect(() => getAllSources(), [])

  // const onEntryClick = (pageId, blockId) => {
  //   navigate(`/pages/${pageId}#${blockId}`)
  // }

  const onPageClick = pageId => {
    navigate(`/pages/${pageId}`)
  }

  const sourcesData = () =>
    Object.entries(state.cache).map(([, value]) => {
      const author = value.authors[0]
      const firstName = author ? author.firstName.textValue : ''
      const lastName = author ? author.lastName.textValue : ''

      return {
        // pageId: value.account,
        text: value.text.textValue,
        author: `${firstName}, ${lastName}`,
      }
    })

  // <SearchSourceLoader query={sourceQuery}>
  //                 {results => {
  //                   setSourcesLoaded(true)
  //                   return (
  //                     <ComposeResults
  //                       results={results}
  //                       onClick={onClick}
  //                       unmount={() => setSourcesLoaded(false)}
  //                     />
  //                   )
  //                 }}
  //               </SearchSourceLoader>

  const ComposeResults = () =>
    sourcesData().map((entry, index) => (
      <View key={index} mb="medium">
        <View height="40px">
          <BaseControl hoverColor="background.2" activeColor="background.3">
            <Grid singleRow alignItems="center" columnGap="small">
              <Icon sizeVariant="small" color="text.3">
                <PageSvg />
              </Icon>
              <Text variant="bodyLarge">{}</Text>
            </Grid>
          </BaseControl>
        </View>
        <BaseControl
          hoverColor="background.2"
          activeColor="background.3"
          onClick={() => onPageClick()}
        >
          <View p="small" ml="small">
            <Text>{entry.text}</Text>
          </View>
        </BaseControl>
      </View>
    ))

  return (
    <ScrollView p="medium" flex="1" maxHeight="98vh">
      <View p="medium">
        <Text variant="bodyLarge" color="text.3">
          All Sources
        </Text>
      </View>
      <EntrySearchLoader query="allSources">{ComposeResults}</EntrySearchLoader>
    </ScrollView>
  )
}

export default SourcesContent
