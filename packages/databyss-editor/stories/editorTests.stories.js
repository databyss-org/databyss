import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import fetchMock from 'fetch-mock'
import SourceProvider from '@databyss-org/services/sources/SourceProvider'
import sourceReducer, {
  initialState as sourceInitialState,
} from '@databyss-org/services/sources/reducer'
import TopicProvider from '@databyss-org/services/topics/TopicProvider'
import topicReducer, {
  initialState as topicInitialState,
} from '@databyss-org/services/topics/reducer'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ContentEditable from '../components/ContentEditable'
import EditorProvider from '../state/EditorProvider'
import { sourceFixture, topicFixture } from './fixtures/refEntities'
import blankState from './fixtures/blankState'
import { slateToJSXString } from './__tests__/__helpers'

const _res = {
  totalItems: 1,
  items: [
    {
      volumeInfo: {
        title: 'Jacques Derrida',
        authors: ['Geoffrey Bennington', 'Jacques Derrida'],
        publisher: 'University of Chicago Press',
        publishedDate: '1999-06-15',
      },
    },
  ],
}

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const EditorWithProvider = ({ initialState }) => {
  const [pageState, setPageState] = useState(null)
  const [slateState, setSlateState] = useState(null)

  // manipulating the state effects reducer
  const onChange = state => {
    const { entityCache, blockCache, blocks } = state
    setPageState({ entityCache, blockCache, blocks })
  }

  // console.log(slateToJSX())

  const onDocumentChange = val => {
    setSlateState(val)
  }
  return (
    <View maxWidth="900px">
      <Box>
        <EditorProvider onChange={onChange} initialState={initialState}>
          <ContentEditable onDocumentChange={onDocumentChange} />
        </EditorProvider>
      </Box>
      <Box maxHeight="300px" overflow="scroll" flexShrink={1}>
        <Text variant="uiTextLargeSemibold">Page State</Text>
        <pre id="pageDocument">{JSON.stringify(pageState, null, 2)}</pre>
      </Box>
      <Box maxHeight="300px" overflow="scroll" flexShrink={1}>
        <Text variant="uiTextLargeSemibold">Slate State</Text>
        <pre id="slateDocument">{JSON.stringify(slateState, null, 2)}</pre>
      </Box>
      <Box maxHeight="300px" overflow="scroll" flexShrink={1}>
        <Text variant="uiTextLargeSemibold">JSX State</Text>
        <pre id="jsxDocument">{slateState && slateToJSXString(slateState)}</pre>
      </Box>
    </View>
  )
}

const EditorWithModals = ({ initialState }) => (
  <TopicProvider initialState={topicInitialState} reducer={topicReducer}>
    <SourceProvider initialState={sourceInitialState} reducer={sourceReducer}>
      <NavigationProvider>
        <EditorWithProvider initialState={initialState} />
      </NavigationProvider>
    </SourceProvider>
  </TopicProvider>
)

storiesOf('Cypress//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('Slate 5', () => {
    fetchMock
      .restore()
      .post(url => {
        if (url.includes('/api/sources') || url.includes('/api/topics')) {
          return true
        }
        return null
      }, 200)
      .get(url => {
        if (url.includes('/api/sources')) {
          return true
        }
        return null
      }, sourceFixture)
      .get(url => {
        if (url.includes('/api/topics')) {
          return true
        }
        return null
      }, topicFixture)
      .get(url => {
        if (url.includes('googleapis')) {
          return true
        }
        return null
      }, _res)

    return <EditorWithModals initialState={blankState} />
  })
