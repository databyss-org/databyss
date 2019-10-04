import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import { View, Button } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/components/Editor/EditorProvider'
import { getRawHtmlForBlock } from '@databyss-org/ui/components/Editor/state/reducer'
import { setActiveBlockType } from '@databyss-org/ui/components/Editor/state/actions'
import SlateContentEditable from '@databyss-org/ui/components/Editor/slate/ContentEditable'
import slateReducer from '@databyss-org/ui/components/Editor/slate/reducer'
import EditorPage from '@databyss-org/ui/components/Editor/EditorPage'
import initialState from '@databyss-org/ui/components/Editor/state/__tests__/initialState'
import { ViewportDecorator } from '../decorators'
import colors from '../../theming/colors'

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

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const ProviderDecorator = storyFn => (
  <EditorProvider initialState={initialState} editableReducer={slateReducer}>
    {storyFn()}
  </EditorProvider>
)

const SlateEditorDemo = () => {
  const [slateDocument, setSlateDocument] = useState({})
  const [editorState] = useEditorContext()
  const { activeBlockId, page, blocks } = editorState

  const editorDocument = {
    activeBlockId,
    pageBlocks: page.blocks.map(block => ({
      ...blocks[block._id],
      rawHtml: getRawHtmlForBlock(editorState, blocks[block._id]),
    })),
  }

  return (
    <Grid>
      <Box mb="medium" maxWidth="500px" flexShrink={1}>
        <EditorPage>
          <SlateContentEditable onDocumentChange={setSlateDocument} />
        </EditorPage>
      </Box>
    </Grid>
  )
}

storiesOf('Editor//Slate Implementation', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('EditorWithMenu', () => (
    <View
      css={{ '& ::selection': { backgroundColor: colors.selectionHighlight } }}
    >
      <ToolbarDemo />
      <SlateEditorDemo />
    </View>
  ))
