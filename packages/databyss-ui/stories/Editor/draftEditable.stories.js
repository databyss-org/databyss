import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { Editor, EditorState } from 'draft-js'
import { View, Button, Grid } from '@databyss-org/ui/primitives'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/editor/EditorProvider'
import { setActiveBlockType } from '@databyss-org/ui/editor/state/page/actions'
import DraftContentEditable from '@databyss-org/ui/editor/draft/ContentEditable'
import draftReducer from '@databyss-org/ui/editor/draft/reducer'
import reducer from '@databyss-org/ui/editor/state/page/reducer'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import initialState from '@databyss-org/ui/editor/state/__tests__/initialState'
import { ViewportDecorator } from '../decorators'

const DraftDemo = () => {
  const [editableState, setDraftState] = useState(EditorState.createEmpty())

  const onChange = _state => {
    setDraftState(_state)
  }

  return <Editor editorState={editableState} onChange={onChange} />
}

const ToolbarDemo = () => {
  const [state, dispatch] = useEditorContext()
  return (
    <Grid mb="medium">
      <View>
        <Button
          onPress={() =>
            dispatch(setActiveBlockType('SOURCE', state.editableState))
          }
        >
          RESOURCE
        </Button>
      </View>
      <View>
        <Button
          onPress={() =>
            dispatch(setActiveBlockType('ENTRY', state.editableState))
          }
        >
          ENTRY
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
  <EditorProvider
    initialState={initialState}
    editableReducer={draftReducer}
    reducer={reducer}
  >
    {storyFn()}
  </EditorProvider>
)

storiesOf('Editor//Draft Implementation', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Draft', () => (
    <Box>
      <DraftDemo />
    </Box>
  ))
  .add('EditorPage', () => (
    <View>
      <ToolbarDemo />
      <Box>
        <EditorPage>
          <DraftContentEditable />
        </EditorPage>
      </Box>
    </View>
  ))
