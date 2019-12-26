import React, { useEffect, useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Button, Text } from '@databyss-org/ui/primitives'
import EditorProvider from '@databyss-org/ui/editor/EditorProvider'
import PageProvider, {
  usePageContext,
  withPages,
} from '@databyss-org/services/pages/PageProvider'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import SourceProvider, {
  useSourceContext,
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

import SourceModal from '@databyss-org/ui/modules/SourcesValueList/SourceModal'

const Box = ({ children }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%">
    {children}
  </View>
)

// add with pages here
const EditorLoader = withPages(({ pages, children }) => {
  const [state, dispatch] = usePageContext()
  const { getAllSources } = useSourceContext()

  useEffect(
    () => {
      getAllSources()
      dispatch(seedPage(seedState))
    },
    [dispatch]
  )

  const pagesRender = pages.map(p => (
    <View key={p._id}>
      <Button onPress={() => dispatch(loadPage(p._id))}>
        <Text>load page {p._id}</Text>
      </Button>
    </View>
  ))

  const [visible, setVisible] = useState(false)

  const onClick = () => {
    setVisible(true)
    //console.log('clicked')
  }

  return (
    <View>
      <Button onClick={onClick}>
        <Text>launch modal</Text>
      </Button>
      <SourceModal visible={visible} sourceId="5e052f8d6beee7c66a4df71a" />
    </View>
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

storiesOf('Services|Test', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Slate Load and Save', () => <LoadAndSave />)
