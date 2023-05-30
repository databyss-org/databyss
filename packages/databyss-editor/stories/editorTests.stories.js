import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Text } from '@databyss-org/ui/primitives'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import fetchMock from 'fetch-mock'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ContentEditable from '../components/ContentEditable'
import EditorProvider from '../state/EditorProvider'
import { sourceFixture, topicFixture } from './fixtures/refEntities'
import blankState from './fixtures/blankState'
import { UserPreferencesProvider } from '../../databyss-ui/hooks'

const queryClient = new QueryClient()

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
  const [, setPageState] = useState(null)
  const [slateState, setSlateState] = useState(null)

  // manipulating the state effects reducer
  const onChange = (state) => {
    const { entityCache, blockCache, blocks } = state
    setPageState({ entityCache, blockCache, blocks })
  }

  // console.log(slateToJSX())

  const onDocumentChange = (val) => {
    setSlateState(JSON.stringify(val, null, 2))
  }

  return (
    <View maxWidth="900px">
      <Box pt="medium">
        <EditorProvider onChange={onChange} initialState={initialState}>
          <ContentEditable onDocumentChange={onDocumentChange} autofocus />
        </EditorProvider>
      </Box>
      <Box maxHeight="300px" overflow="scroll" flexShrink={1}>
        <Text variant="uiTextLargeSemibold">Slate State</Text>
        <pre id="slateDocument">{slateState}</pre>
      </Box>
    </View>
  )
}

const EditorWithModals = ({ initialState }) => (
  <QueryClientProvider client={queryClient}>
    <UserPreferencesProvider>
      <NavigationProvider>
        <EditorWithProvider initialState={initialState} />
      </NavigationProvider>
    </UserPreferencesProvider>
  </QueryClientProvider>
)

storiesOf('Selenium//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('Slate 5', () => {
    fetchMock
      .restore()
      .post((url) => {
        if (url.includes('/api/sources') || url.includes('/api/topics')) {
          return true
        }
        return null
      }, 200)
      .get((url) => {
        if (url.includes('/api/sources')) {
          return true
        }
        return null
      }, sourceFixture)
      .get(
        (url) => {
          if (url.includes('/api/topics')) {
            return true
          }
          return null
        },
        [topicFixture]
      )
      .get((url) => {
        if (url.includes('googleapis')) {
          return true
        }
        return null
      }, _res)

    return <EditorWithModals initialState={blankState} />
  })
