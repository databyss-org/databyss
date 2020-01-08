import React, { useEffect, useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button, Text } from '@databyss-org/ui/primitives'
import EditorProvider from '@databyss-org/ui/editor/EditorProvider'
import PageProvider, {
  usePageContext,
  withPages,
  withPage,
} from '@databyss-org/services/pages/PageProvider'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import SourceProvider, {
  useSourceContext,
  withSources,
} from '@databyss-org/services/sources/SourceProvider'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import { componentMap } from '@databyss-org/ui/components/Navigation/NavigationProvider/componentMap'
import { loadPage, seedPage } from '@databyss-org/services/pages/actions'
import { initialState } from '@databyss-org/services/pages/reducer'

import SlateContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'
import reducer from '@databyss-org/ui/editor/state/page/reducer'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import seedState from './_seedState'
import { ViewportDecorator } from '../decorators'

const Box = ({ children }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%">
    {children}
  </View>
)

const Editor = withPage(({ page, children }) => {
  return (
    <EditorProvider
      initialState={page}
      editableReducer={slateReducer}
      reducer={reducer}
    >
      {/* <AutoSave /> */}
      {children}
    </EditorProvider>
  )
})

const EditorLoader = withPages(({ pages, children }) => {
  const { state, dispatch } = usePageContext()
  const { getSourcesFromList } = useSourceContext()
  const [pageId, setPageId] = useState(null)
  const [pagesRender, setPagesRender] = useState(null)

  useEffect(
    () => {
      dispatch(seedPage(seedState))
    },
    [dispatch]
  )

  // useEffect(
  //   () => {
  //     if (state.cache[pageId]) {
  //       const _sourceList = Object.keys(state.cache[pageId].sources)
  //       getSourcesFromList(_sourceList)
  //     }
  //   },
  //   [state, pageId]
  // )

  useEffect(
    () => {
      setPagesRender(
        pages.map(p => (
          <View key={p._id}>
            <Button
              onPress={() => {
                setPageId(p._id)
              }}
            >
              <Text>load page {p._id}</Text>
            </Button>
          </View>
        ))
      )
    },
    [pages]
  )

  // change this to see if pageID exists
  return !pageId ? (
    <View mb="medium">
      <View>
        <Button onPress={() => dispatch(seedPage(seedState))}>SEED</Button>
      </View>
      {pagesRender}
      <Text> Refresh to seed new page </Text>
    </View>
  ) : (
    // wrapped in with page
    <Editor pageId={pageId}>{children}</Editor>
  )
})

const ProviderDecorator = storyFn => (
  <PageProvider initialState={initialState}>
    <SourceProvider initialState={sourceInitialState} reducer={sourceReducer}>
      <NavigationProvider componentMap={componentMap}>
        <EditorLoader>{storyFn()}</EditorLoader>
      </NavigationProvider>
    </SourceProvider>
  </PageProvider>
)

const LoadAndSave = () => {
  const [slateDocument, setSlateDocument] = useState({})

  // useEffect(
  //   () => {
  //     // ensures that all sources have been loaded into cache before loading the page
  //     if (!sourcesLoaded && pageState.cache[pageId]) {
  //       const list = Object.keys(pageState.pageState.sources)
  //       const _sourceList = list.filter(
  //         s => typeof state.cache[s] === 'undefined'
  //       )
  //       if (_sourceList.length === 0) {
  //         setSourcesLoaded(true)
  //       }
  //     }
  //   },
  //   [pageState, state]
  // )

  return (
    <View>
      <Box>
        <EditorPage autoFocus>
          <SlateContentEditable onDocumentChange={setSlateDocument} />
        </EditorPage>
      </Box>
      <Box overflow="scroll" maxWidth="500px" flexShrink={1}>
        <pre id="slateDocument">{JSON.stringify(slateDocument, null, 2)}</pre>
      </Box>
    </View>
  )
}

storiesOf('Services|Page', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Slate Load and Save', () => <LoadAndSave />)
