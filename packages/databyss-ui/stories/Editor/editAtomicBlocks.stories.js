import React, { useEffect, useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button, Text } from '@databyss-org/ui/primitives'
import EditorProvider from '@databyss-org/ui/editor/EditorProvider'
import PageProvider, {
  usePageContext,
} from '@databyss-org/services/pages/PageProvider'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'

import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { modalDict } from '@databyss-org/ui/components/Navigation/NavigationProvider/modalDict'
import {
  loadPage,
  seedPage,
  getPages,
} from '@databyss-org/services/pages/actions'
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

const EditorLoader = ({ children }) => {
  const [state, dispatch] = usePageContext()

  useEffect(
    () => {
      dispatch(getPages())
    },
    [dispatch]
  )

  const pages = state.pages.map(p => (
    <View key={p._id}>
      <Button onPress={() => dispatch(loadPage(p._id))}>
        <Text>load page {p._id}</Text>
      </Button>
    </View>
  ))

  return state.isLoading ? (
    <View mb="medium">
      <View>
        <Button onPress={() => dispatch(seedPage(seedState))}>SEED</Button>
      </View>
      {pages}
      <Text> is Loading </Text>
    </View>
  ) : (
    <EditorProvider
      initialState={state.pageState}
      editableReducer={slateReducer}
      reducer={reducer}
    >
      <AutoSave />
      {children}
    </EditorProvider>
  )
}

const ProviderDecorator = storyFn => (
  <PageProvider initialState={initialState}>
    <SourceProvider initialState={sourceInitialState} reducer={sourceReducer}>
      <NavigationProvider modalDict={modalDict}>
        <EditorLoader>{storyFn()}</EditorLoader>
      </NavigationProvider>
    </SourceProvider>
  </PageProvider>
)

storiesOf('Services|Atomic Blocks', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Edit Atomic Blocks', () => {
    const [slateDocument, setSlateDocument] = useState({})

    return (
      <View>
        <Box>
          <EditorPage>
            <SlateContentEditable onDocumentChange={setSlateDocument} />
          </EditorPage>
        </Box>
        <Box overflow="scroll" maxWidth="500px" flexShrink={1}>
          <pre id="slateDocument">{JSON.stringify(slateDocument, null, 2)}</pre>
        </Box>
      </View>
    )
  })

// dont update editor when source is updated
// update when onDismiss is called
// when modal is hidden update editor state

// from souceModal turn off autosave in page provider
// pass the modalDictionary

// writes test using mock for updating sources

// within editor provider dispatch source provider or new source
