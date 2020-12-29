import React, { useState, useRef, useCallback } from 'react'
import { throttle } from 'lodash'
import { storiesOf } from '@storybook/react'
import { View, Text, Button } from '@databyss-org/ui/primitives'
import {
  ViewportDecorator,
  NotifyDecorator,
} from '@databyss-org/ui/stories/decorators'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import SessionProvider, {
  useSessionContext,
} from '@databyss-org/services/session/SessionProvider'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import topicReducer, {
  initialState as topicInitialState,
} from '@databyss-org/services/topics/reducer'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import * as pageServices from '@databyss-org/services/pages/'
import PageProvider, {
  usePageContext,
} from '@databyss-org/services/pages/PageProvider'
import { initialState as pageInitialState } from '@databyss-org/services/pages/reducer'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import {
  cleanupPatches,
  addMetaToPatches,
  editorStateToPage,
  pageToEditorState,
} from '../state/util'
import ContentEditable from '../components/ContentEditable'
import { withMetaData } from '../lib/util'
import EditorProvider from '../state/EditorProvider'
import basicFixture from './fixtures/basic'
import connectedFixture from './fixtures/connectedState'

const LoginRequired = () => (
  <Text>You must login before running this story</Text>
)

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const PageWithAutosave = ({ page, refreshPage }) => {
  const { setPatches } = usePageContext()
  const [, setPageState] = useState(null)

  const operationsQueue = useRef([])

  const throttledAutosave = useCallback(
    throttle(({ nextState, patches }) => {
      const _patches = cleanupPatches(patches)
      if (_patches?.length) {
        const payload = {
          id: nextState.pageHeader._id,
          patches: operationsQueue.current,
        }
        refreshPage()
        setPatches(payload)
        operationsQueue.current = []
      }
    }, 100),
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
    <Box width="400px" overflow="scroll" flexShrink={1}>
      <Text variant="uiTextLarge">Editor</Text>
      <EditorProvider onChange={onChange} initialState={withMetaData(page)}>
        <ContentEditable onDocumentChange={onDocumentChange} autofocus />
      </EditorProvider>
    </Box>
  )
}

const StaticPage = ({ page }) => (
  <Box width="400px" overflow="scroll" flexShrink={1}>
    <Text variant="uiTextLarge">From database</Text>
    <EditorProvider initialState={withMetaData(page)}>
      <ContentEditable readonly />
    </EditorProvider>
  </Box>
)

const EditorWithProvider = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { setPage } = usePageContext()
  const [_page, _setPage] = useState(null)

  // PAGE GETS REFRESHED EVERY 5 SECONDS
  const _refreshPage = useCallback(
    throttle(() => {
      _setPage(null)
      pageServices.loadPage(account.defaultPage).then((p) => _setPage(p))
    }, 5000),
    []
  )

  const _defaultPage = editorStateToPage(connectedFixture(account.defaultPage))

  return (
    <View>
      <View display="-webkit-box">
        <Button
          id="clear-state"
          m="small"
          onClick={() => {
            setPage(_defaultPage)
          }}
        >
          <Text>clear state</Text>
        </Button>
      </View>
      <View display="-webkit-box">
        <PageLoader pageId={account.defaultPage}>
          {(page) => {
            if (page.name !== 'test document') {
              setPage(_defaultPage)
              return null
            }
            return (
              <PageWithAutosave
                page={pageToEditorState(page)}
                refreshPage={_refreshPage}
              />
            )
          }}
        </PageLoader>
        {_page && <StaticPage page={_page} />}
      </View>
    </View>
  )
}

const EditorWithModals = () => (
  <ServiceProvider>
    <SessionProvider unauthorizedChildren={<LoginRequired />}>
      <PageProvider initialState={pageInitialState}>
        <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
          <SourceProvider
            initialState={sourceInitialState}
            reducer={sourceReducer}
          >
            <NavigationProvider>
              <EditorWithProvider />
            </NavigationProvider>
          </SourceProvider>
        </TopicProvider>
      </PageProvider>
    </SessionProvider>
  </ServiceProvider>
)

storiesOf('Services|Page', module)
  .addDecorator(NotifyDecorator)
  .addDecorator(ViewportDecorator)
  .add('Side by side', () => <EditorWithModals initialState={basicFixture} />)
