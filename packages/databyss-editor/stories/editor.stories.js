import React, { useState, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createEditor } from '@databyss-org/slate'
import { withReact } from '@databyss-org/slate-react'
import { storiesOf } from '@storybook/react'
import { View, Grid } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import fetchMock from 'fetch-mock'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import ContentEditable from '../components/ContentEditable'
import { stateToSlate } from '../lib/slateUtils'
import Editor from '../components/Editor'
import EditorProvider from '../state/EditorProvider'
import basicFixture from './fixtures/basic'
import blankFixture from './fixtures/blankState'
import { sourceFixture, topicFixture } from './fixtures/refEntities'
import noAtomicsFixture from './fixtures/no-atomics'
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

const EditorWithProvider = (props) => (
  <EditorProvider {...props}>
    <ContentEditable autofocus />
  </EditorProvider>
)

const SideBySide = ({ initialState }) => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const [editorState, setEditorState] = useState([])
  return (
    <Grid>
      <View width="40%">
        <EditorWithProvider
          initialState={initialState}
          onChange={(s) => {
            if (!s) {
              return
            }
            // console.log(s)
            setEditorState(stateToSlate(s.state))
          }}
        />
      </View>
      <View width="40%">
        <Editor editor={editor} value={editorState} />
      </View>
    </Grid>
  )
}

const EditorWithModals = ({ initialState }) => (
  <QueryClientProvider client={queryClient}>
    <UserPreferencesProvider>
      <NavigationProvider>
        <EditorWithProvider
          initialState={initialState}
          onChange={({ patch, inversePatch }) => {
            console.log(patch, inversePatch)
          }}
        />
      </NavigationProvider>
    </UserPreferencesProvider>
  </QueryClientProvider>
)

const initFetchMock = () => {
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
}

storiesOf('Components|Editor', module)
  .addDecorator(ViewportDecorator)
  .add('Basic', () => <SideBySide initialState={blankFixture} />)
  .add('Basic (standalone)', () => (
    <EditorWithProvider
      initialState={basicFixture}
      onChange={({ inversePatch }) => {
        console.log(inversePatch)
      }}
    />
  ))
  .add('No Atomics (standalone)', () => (
    <EditorWithProvider initialState={noAtomicsFixture} />
  ))
  .add('With Ref Modals', () => {
    initFetchMock()
    return <EditorWithModals initialState={basicFixture} />
  })
  .add('Blank', () => {
    initFetchMock()
    return <EditorWithModals initialState={blankFixture} />
  })
