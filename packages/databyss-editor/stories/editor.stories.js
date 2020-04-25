import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Grid } from '@databyss-org/ui/primitives'
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
import { stateToSlate } from '../lib/slateUtils'
import Editor from '../components/Editor'
import EditorProvider from '../state/EditorProvider'
import basicFixture from './fixtures/basic'
import { sourceFixture, topicFixture } from './fixtures/refEntities'
import noAtomicsFixture from './fixtures/no-atomics'

const EditorWithProvider = props => (
  <EditorProvider {...props}>
    <ContentEditable />
  </EditorProvider>
)

const SideBySide = ({ initialState }) => {
  const [editorState, setEditorState] = useState([])
  return (
    <Grid>
      <View width="40%">
        <EditorWithProvider
          initialState={initialState}
          onChange={s => setEditorState(stateToSlate(s))}
        />
      </View>
      <View width="40%">
        <Editor value={editorState} />
      </View>
    </Grid>
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

storiesOf('Components|Editor', module)
  .addDecorator(ViewportDecorator)
  .add('Basic', () => <SideBySide initialState={basicFixture} />)
  .add('Basic (standalone)', () => (
    <EditorWithProvider initialState={basicFixture} />
  ))
  .add('No Atomics (standalone)', () => (
    <EditorWithProvider initialState={noAtomicsFixture} />
  ))
  .add('With Ref Modals', () => {
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
    return <EditorWithModals initialState={basicFixture} />
  })
