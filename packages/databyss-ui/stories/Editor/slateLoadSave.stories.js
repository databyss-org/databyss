import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text } from '@databyss-org/ui/primitives'
import ServiceProvider from '@databyss-org/services/lib/ServiceProvider'
import EditorProvider from '@databyss-org/ui/editor/EditorProvider'
import PageProvider, {
  usePageContext,
} from '@databyss-org/services/pages/PageProvider'
import SessionProvider, {
  useSessionContext,
} from '@databyss-org/services/session/SessionProvider'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'

import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import topicReducer, {
  initialState as topicInitialState,
} from '@databyss-org/services/topics/reducer'

import { initialState } from '@databyss-org/services/pages/reducer'
import SlateContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'
import reducer from '@databyss-org/ui/editor/state/page/reducer'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { ViewportDecorator } from '../decorators'
import seedState from './_seedState'

const LoginRequired = () => (
  <Text>You must login before running this story</Text>
)

const ProviderDecorator = storyFn => (
  <ServiceProvider>
    <SessionProvider unauthorizedChildren={<LoginRequired />}>
      <PageProvider initialState={initialState}>
        <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
          <SourceProvider
            initialState={sourceInitialState}
            reducer={sourceReducer}
          >
            <NavigationProvider>{storyFn()}</NavigationProvider>
          </SourceProvider>
        </TopicProvider>
      </PageProvider>
    </SessionProvider>
  </ServiceProvider>
)

const LoadAndSave = () => {
  const { getSession } = useSessionContext()
  const { account } = getSession()
  const { setPage } = usePageContext()
  const [slateDocument, setSlateDocument] = useState({})

  return (
    <PageLoader pageId={account.defaultPage}>
      {page => {
        // seed if empty and reload
        if (page.page.name !== 'test document') {
          setPage(seedState(account.defaultPage))
          return null
        }
        return (
          <View alignItems="stretch" flexGrow={1} width="100%">
            <EditorProvider
              initialState={page}
              reducer={reducer}
              editableReducer={slateReducer}
            >
              <AutoSave />
              <EditorPage autoFocus>
                <SlateContentEditable onDocumentChange={setSlateDocument} />
              </EditorPage>
            </EditorProvider>
            <View
              overflow="scroll"
              flexShrink={1}
              borderVariant="thinDark"
              paddingVariant="tiny"
              width="100%"
            >
              <pre id="slateDocument">
                {JSON.stringify(slateDocument, null, 2)}
              </pre>
            </View>
          </View>
        )
      }}
    </PageLoader>
  )
}

storiesOf('Services|Page', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Slate Load and Save', () => <LoadAndSave />)
