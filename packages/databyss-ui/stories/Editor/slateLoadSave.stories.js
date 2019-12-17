import React, { useEffect, useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button, Text, Grid } from '@databyss-org/ui/primitives'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/editor/EditorProvider'
import PageProvider, {
  usePageContext,
} from '@databyss-org/services/pages/PageProvider'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import { modalDict } from '@databyss-org/ui/components/Navigation/NavigationProvider/modalDict'
import {
  loadPage,
  savePage,
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
import { ifStatement } from '@babel/types'

const ToolbarDemo = () => {
  const [state] = useEditorContext()
  const [, dispatchPage] = usePageContext()

  return (
    <Grid mb="medium">
      <View>
        <Button onPress={() => dispatchPage(savePage(state))}>SAVE</Button>
      </View>
    </Grid>
  )
}

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
      dispatch(seedPage(seedState))
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
      <Text> Refresh to seed new page </Text>
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

const LoadAndSave = () => {
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
}

storiesOf('Services|Page', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Slate Load and Save', () => <LoadAndSave />)
