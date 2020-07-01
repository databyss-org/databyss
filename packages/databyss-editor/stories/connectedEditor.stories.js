import React, { useState, useRef, useCallback } from 'react'
import { throttle } from 'lodash'
import { storiesOf } from '@storybook/react'
import { View, Text, Button } from '@databyss-org/ui/primitives'
import {
  ViewportDecorator,
  NotifyDecorator,
} from '@databyss-org/ui/stories/decorators'
import {
  cleanupPatches,
  addMetaToPatches,
  editorStateToPage,
  pageToEditorState,
} from '../state/util'
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
import PageProvider, {
  usePageContext,
} from '@databyss-org/services/pages/PageProvider'
import { initialState as pageInitialState } from '@databyss-org/services/pages/reducer'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import ContentEditable from '../components/ContentEditable'
import { withMetaData } from '../lib/util'
import EditorProvider from '../state/EditorProvider'
import connectedFixture from './fixtures/connectedState'
import ModalManager from '@databyss-org/ui/modules/Modals/ModalManager'

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
  const [pageState, setPageState] = useState(null)

  const operationsQueue = useRef([])

  const throttledAutosave = useCallback(
    throttle(({ nextState, patches }) => {
      const _patches = cleanupPatches(patches)
      if (_patches?.length) {
        const payload = {
          id: nextState.pageHeader._id,
          patches: operationsQueue.current,
        }
        setPatches(payload)
        operationsQueue.current = []
      }
    }, 500),
    []
  )

  const onDocumentChange = val => {
    setPageState(JSON.stringify(val, null, 2))
  }

  const onChange = value => {
    const patches = addMetaToPatches(value)
    // push changes to a queue
    operationsQueue.current = operationsQueue.current.concat(patches)
    throttledAutosave({ ...value, patches })
  }

  return (
    <View>
      <EditorProvider onChange={onChange} initialState={withMetaData(page)}>
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
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { setPage } = usePageContext()

  const _defaultPage = editorStateToPage(connectedFixture(account.defaultPage))

  return (
    <View>
      <Button
        id="clear-state"
        mb="small"
        onClick={() => {
          setPage(_defaultPage)
        }}
      >
        <Text>clear state</Text>
      </Button>
      <PageLoader pageId={account.defaultPage}>
        {page => {
          if (page.name !== 'test document') {
            setPage(_defaultPage)
            return null
          }

          return <PageWithAutosave page={pageToEditorState(page)} />
        }}
      </PageLoader>
    </View>
  )
}

const EditorWithModals = () => (
  <ServiceProvider>
    <SessionProvider unauthorizedChildren={<LoginRequired />}>
      <PageProvider initialState={pageInitialState}>
        <SourceProvider>
          <EditorWithProvider />
          <ModalManager />
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
