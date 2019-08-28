import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { Editor, EditorState } from 'draft-js'
import { View, Button } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import DraftEditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/components/Editor/DraftEditorProvider'
import { setActiveBlockType } from '@databyss-org/ui/components/Editor/state/actions'
import Page from '@databyss-org/ui/components/Editor/Page'
import initialState from '@databyss-org/ui/components/Editor/state/__tests__/initialState'
import { ViewportDecorator } from '../decorators'

const DraftDemo = () => {
  const [draftState, setDraftState] = useState(EditorState.createEmpty())

  const onChange = _state => {
    // const _selection = _state.getSelection()
    // console.log('onChange', {
    //   type: _state.getLastChangeType(),
    //   selection: {
    //     focusKey: _selection.getFocusKey(),
    //     focusOfset: _selection.getFocusOffset(),
    //   },
    // })
    // console.log('onChange', _state)
    setDraftState(_state)
  }

  return <Editor editorState={draftState} onChange={onChange} />
}

const ToolbarDemo = () => {
  const [state, dispatch] = useEditorContext()
  return (
    <Grid mb="medium">
      <View>
        <Button
          onPress={() =>
            dispatch(setActiveBlockType('SOURCE', state.draftState))
          }
        >
          RESOURCE
        </Button>
      </View>
      <View>
        <Button
          onPress={() =>
            dispatch(setActiveBlockType('ENTRY', state.draftState))
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
  <DraftEditorProvider initialState={initialState}>
    {storyFn()}
  </DraftEditorProvider>
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
        <Page />
      </Box>
    </View>
  ))
