import React, { useState, useRef, useCallback } from 'react'
import { throttle } from 'lodash'
import { storiesOf } from '@storybook/react'
import { View, Text } from '@databyss-org/ui/primitives'
import {
  ViewportDecorator,
  NotifyDecorator,
} from '@databyss-org/ui/stories/decorators'
import {
  withWhitelist,
  addMetaData,
} from '@databyss-org/services/pages/_helpers'
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

const PageWithAutosave = ({ page }) => {
  const { setPatch } = usePageContext()
  const [pageState, setPageState] = useState(null)
  const [counter, setCounter] = useState(0)

  const operationsQueue = useRef([])

  const throttledAutosave = useCallback(
    throttle(({ state, patch }) => {
      const _patch = withWhitelist(patch)
      if (_patch.length) {
        const payload = {
          id: state.page._id,
          patch: operationsQueue.current,
        }
        setPatch(payload)
        operationsQueue.current = []
      }
    }, 1000),
    []
  )

  const onDocumentChange = val => {
    if (counter > 0) {
      setPageState(val)
    }
    setCounter(counter + 1)
  }

  const onChange = value => {
    const _value = addMetaData(value)
    // push changes to a queue
    operationsQueue.current = operationsQueue.current.concat(_value.patch)
    throttledAutosave(_value)
  }

  return (
    <View>
      <EditorProvider onChange={onChange} initialState={withMetaData(page)}>
        <ContentEditable onDocumentChange={onDocumentChange} autofocus />
      </EditorProvider>
      <Box maxHeight="300px" overflow="scroll" flexShrink={1}>
        <Text variant="uiTextLargeSemibold">Slate State</Text>
        <pre id="slateDocument">{JSON.stringify(pageState, null, 2)}</pre>
      </Box>
    </View>
  )
}

const EditorWithProvider = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { setPage } = usePageContext()

  return (
    <View>
      <PageLoader pageId={account.defaultPage}>
        {page => {
          if (page.page.name !== 'test document') {
            setPage(connectedFixture(account.defaultPage))
            return null
          }

          return <PageWithAutosave page={page} />
        }}
      </PageLoader>
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
  .add('Slate 5', () => <EditorWithModals initialState={basicFixture} />)
