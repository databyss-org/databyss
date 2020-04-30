import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text, Button } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
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

const EditorWithProvider = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { setPage } = usePageContext()
  const [pageState, setPageState] = useState(null)

  return (
    <PageLoader pageId={account.defaultPage}>
      {page => {
        if (page.page.name !== 'test document') {
          setPage(connectedFixture(account.defaultPage))
          return null
        }

        return (
          <View>
            <Button onClick={() => setPage(pageState)}>
              <Text>Save Page</Text>
            </Button>
            <EditorProvider
              onChange={setPageState}
              initialState={withMetaData(page)}
            >
              <ContentEditable />
            </EditorProvider>
          </View>
        )
      }}
    </PageLoader>
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
  .addDecorator(ViewportDecorator)
  .add('Slate 5', () => <EditorWithModals initialState={basicFixture} />)
