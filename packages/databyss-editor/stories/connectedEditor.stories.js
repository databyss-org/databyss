import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Grid, Text } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import fetchMock from 'fetch-mock'
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
import { stateToSlate } from '../lib/slateUtils'
import Editor from '../components/Editor'
import EditorProvider from '../state/EditorProvider'
import basicFixture from './fixtures/basic'
import { sourceFixture, topicFixture } from './fixtures/refEntities'
import connectedFixture from './fixtures/connectedState'
import noAtomicsFixture from './fixtures/no-atomics'

const LoginRequired = () => (
  <Text>You must login before running this story</Text>
)

const EditorWithProvider = props => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { setPage } = usePageContext()

  console.log(account.defaultPage)
  return (
    <PageLoader pageId={account.defaultPage}>
      {page => {
        console.log(page)
        if (page.page.name !== 'test document') {
          setPage(connectedFixture(account.defaultPage))
          return null
        }
        console.log(props)
        return (
          <EditorProvider {...props}>
            <ContentEditable />
          </EditorProvider>
        )
      }}
    </PageLoader>
  )
}

const EditorWithModals = ({ initialState }) => (
  <ServiceProvider>
    <SessionProvider unauthorizedChildren={<LoginRequired />}>
      <PageProvider initialState={pageInitialState}>
        <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
          <SourceProvider
            initialState={sourceInitialState}
            reducer={sourceReducer}
          >
            <NavigationProvider>
              <EditorWithProvider initialState={initialState} />
            </NavigationProvider>
          </SourceProvider>
        </TopicProvider>
      </PageProvider>
    </SessionProvider>
  </ServiceProvider>
)

storiesOf('Services|Page', module)
  .addDecorator(ViewportDecorator)
  .add('Slate 5', () => {
    return <EditorWithModals initialState={basicFixture} />
  })
