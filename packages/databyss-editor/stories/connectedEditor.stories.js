import React, { useState, useRef, useCallback, useEffect } from 'react'
import { debounce } from 'lodash'
import { storiesOf } from '@storybook/react'
import { View, Text } from '@databyss-org/ui/primitives'
import {
  ViewportDecorator,
  NotifyDecorator,
} from '@databyss-org/ui/stories/decorators'
import ModalManager from '@databyss-org/ui/modules/Modals/ModalManager'
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
import { db } from '@databyss-org/data/pouchdb/db'
import { Page } from '@databyss-org/services/interfaces'
import HistoryProvider from '../history/EditorHistory'
import ContentEditable from '../components/ContentEditable'
import { withMetaData } from '../lib/util'
import EditorProvider from '../state/EditorProvider'
// import connectedFixture from './fixtures/connectedState'
import {
  cleanupPatches,
  addMetaToPatches,
  // editorStateToPage,
  pageToEditorState,
  optimizePatches,
} from '../state/util'

const LoginRequired = () => (
  <Text>You must login before running this story</Text>
)

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const PageWithAutosave = ({ page }) => {
  const { setPatches } = usePageContext()
  const isDbBusy = useSessionContext((c) => c && c.isDbBusy)
  const _isDbBusy = isDbBusy()
  const [pageState, setPageState] = useState(null)
  const [showSaving, setShowSaving] = useState(false)

  // debonce the ui component showing the saving icon
  const debounceSavingIcon = useCallback(
    debounce(
      (count) => {
        setShowSaving(count)
      },
      2500,
      { leading: true }
    ),
    []
  )

  useEffect(() => {
    debounceSavingIcon(_isDbBusy)
  }, [_isDbBusy])

  const operationsQueue = useRef([])

  const throttledAutosave = useCallback(
    debounce(
      ({ nextState, patches }) => {
        const _patches = cleanupPatches(patches)
        if (_patches?.length) {
          const payload = {
            id: nextState.pageHeader._id,
            patches: optimizePatches(operationsQueue.current),
          }
          setPatches(payload)
          operationsQueue.current = []
        }
      },
      500,
      { leading: true, maxWait: 500 }
    ),
    []
  )

  const onDocumentChange = (val) => {
    setPageState(JSON.stringify(val, null, 2))
  }

  const onChange = (value) => {
    const patches = addMetaToPatches(value)
    // push changes to a queue
    operationsQueue.current = operationsQueue.current.concat(patches)
    throttledAutosave({ ...value, patches })
  }

  return (
    <View>
      <HistoryProvider>
        <EditorProvider onChange={onChange} initialState={withMetaData(page)}>
          <ContentEditable onDocumentChange={onDocumentChange} autofocus />
        </EditorProvider>
      </HistoryProvider>
      <Box maxHeight="300px" overflow="scroll" flexShrink={1}>
        <Text variant="uiTextLargeSemibold">Slate State</Text>
        <pre id="slateDocument">{pageState}</pre>
      </Box>
      {!showSaving ? (
        <Text id="complete" variant="uiText">
          changes saved
        </Text>
      ) : null}
    </View>
  )
}

const EditorWithProvider = () => {
  const { getSession } = useSessionContext()
  const { defaultPageId } = getSession()
  const { setPage } = usePageContext()

  const _pageId = defaultPageId

  // save new page
  const _page = new Page(_pageId)

  useEffect(() => {
    // check to see if page exists in DB, if not add page
    db.find({ selector: { _id: _pageId } }).then((res) => {
      if (!res.docs.length) {
        setPage(_page)
      }
    })
  }, [])

  return (
    <View>
      <PageLoader pageId={_pageId}>
        {(page) => <PageWithAutosave page={pageToEditorState(page)} />}
      </PageLoader>
    </View>
  )
}

const EditorWithModals = () => (
  <ServiceProvider>
    <SessionProvider unauthorizedChildren={<LoginRequired />}>
      <PageProvider initialState={pageInitialState}>
        <SourceProvider>
          <TopicProvider>
            <CatalogProvider>
              <EditorWithProvider />
              <ModalManager />
            </CatalogProvider>
          </TopicProvider>
        </SourceProvider>
      </PageProvider>
    </SessionProvider>
  </ServiceProvider>
)

storiesOf('Services|Page', module)
  .addDecorator(NotifyDecorator)
  .addDecorator(ViewportDecorator)
  .add('Slate 5', () => (
    <NavigationProvider>
      <EditorWithModals />
    </NavigationProvider>
  ))
