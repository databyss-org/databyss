import React, { useState, useRef, useCallback, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { getDefaultGroup } from '@databyss-org/services/session/clientStorage'
import { debounce } from 'lodash'
import { storiesOf } from '@storybook/react'
import { View, Text } from '@databyss-org/ui/primitives'
import { EditorPageLoader } from '@databyss-org/ui/components/Loaders'
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
import {
  useEditorPageContext,
  EditorPageProvider,
} from '@databyss-org/services'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import { dbRef } from '@databyss-org/data/pouchdb/db'
import { normalizePage } from '@databyss-org/data/pouchdb/pages/util'
import { upsert } from '@databyss-org/data/pouchdb/utils'
import { Page } from '@databyss-org/services/interfaces'
import HistoryProvider from '../history/EditorHistory'
import ContentEditable from '../components/ContentEditable'
import { withMetaData } from '../lib/util'
import EditorProvider from '../state/EditorProvider'
import { addMetaToPatches, pageToEditorState } from '../state/util'

const queryClient = new QueryClient()

const LoginRequired = () => (
  <Text>You must login before running this story</Text>
)

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const PageWithAutosave = ({ page }) => {
  // const { setPatches } = usePageContext()
  const isDbBusy = useSessionContext((c) => c && c.isDbBusy)
  const _isDbBusy = isDbBusy()
  const [pageState, setPageState] = useState(null)
  const [showSaving, setShowSaving] = useState(false)
  const setPatches = useEditorPageContext((c) => c.setPatches)

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

  const onDocumentChange = (val) => {
    setPageState(JSON.stringify(val, null, 2))
  }

  const onChange = (value) => {
    const _patches = addMetaToPatches(value)

    const payload = {
      id: value.nextState.pageHeader._id,
      patches: _patches,
    }
    setPatches(payload)

    if (_patches.length) {
      // blocks array in page might have changed, upsert page blocks
      const _nextBlocks = normalizePage(value.nextState).blocks
      const { _id } = value.nextState.pageHeader
      const _page = { blocks: _nextBlocks, _id }

      upsert({ $type: 'PAGE', _id: _page._id, doc: _page })
    }
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
  // const { setPage } = usePageContext()
  const setPage = useEditorPageContext((c) => c.setPage)

  const _pageId = defaultPageId

  // save new page
  const _page = new Page(_pageId)

  useEffect(() => {
    // check to see if page exists in DB, if not add page

    dbRef.current.find({ selector: { _id: _pageId } }).then((res) => {
      if (!res.docs.length) {
        setPage(_page)
      }
    })
  }, [])

  return (
    <View>
      <EditorPageLoader key={_pageId} pageId={_pageId}>
        {(page) => <PageWithAutosave page={pageToEditorState(page)} />}
      </EditorPageLoader>
    </View>
  )
}

const EditorWithModals = () => (
  <ServiceProvider>
    <SessionProvider unauthorizedChildren={<LoginRequired />}>
      <QueryClientProvider client={queryClient}>
        <EditorPageProvider>
          <SourceProvider>
            <CatalogProvider>
              <EditorWithProvider />
              <ModalManager />
            </CatalogProvider>
          </SourceProvider>
        </EditorPageProvider>
      </QueryClientProvider>
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
