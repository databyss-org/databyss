import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { Editor, EditorState } from 'draft-js'
import { View, Button } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/components/Editor/EditorProvider'
import { setActiveBlockType } from '@databyss-org/ui/components/Editor/state/actions'
import DraftDocumentView from '@databyss-org/ui/components/Editor/DocumentView'
import initialState from '@databyss-org/ui/components/Editor/_document'
import { ViewportDecorator } from '../decorators'

const DraftDemo = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())

  const onChange = _state => {
    const _selection = _state.getSelection()
    // console.log('onChange', {
    //   type: _state.getLastChangeType(),
    //   selection: {
    //     focusKey: _selection.getFocusKey(),
    //     focusOfset: _selection.getFocusOffset(),
    //   },
    // })
    // console.log('onChange', _state)
    setEditorState(_state)
  }

  return <Editor editorState={editorState} onChange={onChange} />
}

const ToolbarDemo = () => {
  const [, dispatch] = useEditorContext()
  return (
    <Grid mb="medium">
      <View>
        <Button onPress={() => dispatch(setActiveBlockType('RESOURCE'))}>
          RESOURCE
        </Button>
      </View>
      <View>
        <Button onPress={() => dispatch(setActiveBlockType('HEADER'))}>
          HEADER
        </Button>
      </View>
    </Grid>
  )
}

const Box = ({ children }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%">
    {children}
  </View>
)

const ProviderDecorator = storyFn => (
  <EditorProvider initialState={initialState}>{storyFn()}</EditorProvider>
)

storiesOf('Editor//Draft Implementation', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Draft', () => (
    <Box>
      <DraftDemo />
    </Box>
  ))
  .add('DocumentView', () => (
    <View>
      <ToolbarDemo />
      <Box>
        <DraftDocumentView />
      </Box>
    </View>
  ))
