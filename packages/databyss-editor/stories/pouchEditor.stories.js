import React, { useState, useRef, useCallback } from 'react'
import { throttle } from 'lodash'
import { storiesOf } from '@storybook/react'
import { View, Text } from '@databyss-org/ui/primitives'
import {
  ViewportDecorator,
  NotifyDecorator,
} from '@databyss-org/ui/stories/decorators'
import ModalManager from '@databyss-org/ui/modules/Modals/ModalManager'
import DatabaseProvider from '@databyss-org/services/database/DatabaseProvider'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import CatalogProvider from '@databyss-org/services/catalog/CatalogProvider'
import SessionProvider, {
  useSessionContext,
} from '@databyss-org/services/session/SessionProvider'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import PageProvider, {
  usePageContext,
} from '@databyss-org/services/pages/PageProvider'
import { initialState as pageInitialState } from '@databyss-org/services/pages/reducer'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import HistoryProvider from '../history/EditorHistory'
import ContentEditable from '../components/ContentEditable'
import { withMetaData } from '../lib/util'
import EditorProvider from '../state/EditorProvider'
import connectedFixture from './fixtures/connectedState'
import {
  cleanupPatches,
  addMetaToPatches,
  editorStateToPage,
  pageToEditorState,
} from '../state/util'
import blankState from './fixtures/blankState'

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const PageBody = ({ page }) => {
  const [pageState, setPageState] = useState(null)

  const onDocumentChange = (val) => {
    setPageState(JSON.stringify(val, null, 2))
  }

  return (
    <View>
      <EditorProvider
        // onChange={onChange}
        initialState={withMetaData(page)}
      >
        <ContentEditable onDocumentChange={onDocumentChange} autofocus />
      </EditorProvider>
      <Box maxHeight="300px" overflow="scroll" flexShrink={1}>
        <Text variant="uiTextLargeSemibold">Slate State</Text>
        <pre id="slateDocument">{pageState}</pre>
      </Box>
    </View>
  )
}

const EditorWithProvider = () => {
  const _defaultPage = editorStateToPage(connectedFixture('test_page_id'))

  console.log(pageToEditorState(_defaultPage))

  return (
    <View>
      <PageBody page={pageToEditorState(_defaultPage)} />
    </View>
  )
}

const EditorWithModals = () => (
  <DatabaseProvider>
    <CatalogProvider>
      <EditorWithProvider initialState={blankState} />
      <ModalManager />
    </CatalogProvider>
  </DatabaseProvider>
)

storiesOf('Services|Page', module)
  .addDecorator(NotifyDecorator)
  .addDecorator(ViewportDecorator)
  .add('Slate - PouchDb', () => (
    <NavigationProvider>
      <EditorWithModals />
    </NavigationProvider>
  ))
