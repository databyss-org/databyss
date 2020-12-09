import React, { useState, useRef, useCallback, useEffect } from 'react'
import _ from 'lodash'
import { storiesOf } from '@storybook/react'
import { View, Text, Button } from '@databyss-org/ui/primitives'
import {
  ViewportDecorator,
  NotifyDecorator,
} from '@databyss-org/ui/stories/decorators'
import ModalManager from '@databyss-org/ui/modules/Modals/ModalManager'
import DatabaseProvider, {
  useDatabaseContext,
} from '@databyss-org/services/database/DatabaseProvider'
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
import {
  PageLoader,
  PouchDbLoader,
  PouchPageLoader,
} from '@databyss-org/ui/components/Loaders'
import HistoryProvider from '../history/EditorHistory'
import ContentEditable from '../components/ContentEditable'
import { withMetaData } from '../lib/util'
import EditorProvider from '../state/EditorProvider'
import connectedFixture from './fixtures/connectedState'
import { editorStateToPage, pageToEditorState } from '../state/util'
import blankState from './fixtures/blankState'

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const PageBody = ({ page }) => {
  const putDocument = useDatabaseContext((c) => c && c.putDocument)

  const [pageState, setPageState] = useState(null)
  const [editorState, setEditorState] = useState(null)

  useEffect(() => {
    setEditorState(withMetaData(page))
  }, [])

  const onDocumentChange = (val) => {
    setPageState(JSON.stringify(val, null, 2))
  }

  const onChange = _.debounce((val) => {
    putDocument({ ...val.nextState, _id: 'test_doc' })
  }, 500)

  return (
    <View>
      <Button onClick={() => putDocument({ ...editorState, _id: 'test_doc' })}>
        put doc
      </Button>
      <PouchDbLoader>
        {() => (
          <PouchPageLoader pageId="test_doc">
            {(pageState) => (
              <EditorProvider onChange={onChange} initialState={pageState}>
                <ContentEditable
                  initialState={pageState}
                  onDocumentChange={onDocumentChange}
                  autofocus
                />
              </EditorProvider>
            )}
          </PouchPageLoader>
        )}
      </PouchDbLoader>

      <Box maxHeight="300px" overflow="scroll" flexShrink={1}>
        <Text variant="uiTextLargeSemibold">Slate State</Text>
        <pre id="slateDocument">{pageState}</pre>
      </Box>
    </View>
  )
}

const EditorWithProvider = () => {
  const _defaultPage = editorStateToPage(connectedFixture('test_page_id'))

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
