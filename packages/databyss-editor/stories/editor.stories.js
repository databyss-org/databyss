import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Grid } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '@databyss-org/ui/stories/decorators'
import ContentEditable from '../components/ContentEditable'
import { stateToSlate } from '../lib/slateUtils'
import Editor from '../components/Editor'
import EditorProvider from '../state/EditorProvider'
import initialState from './fixtures/basic'

const App = () => {
  const [editorState, setEditorState] = useState([])
  return (
    <Grid>
      <View width="40%" pl={20}>
        <EditorProvider
          initialState={initialState}
          onChange={s => setEditorState(stateToSlate(s))}
        >
          <ContentEditable />
        </EditorProvider>
      </View>
      <View width="40%">
        <Editor value={editorState} />
      </View>
    </Grid>
  )
}

storiesOf('Components|Editor', module)
  .addDecorator(ViewportDecorator)
  .add('Basic', () => <App />)
