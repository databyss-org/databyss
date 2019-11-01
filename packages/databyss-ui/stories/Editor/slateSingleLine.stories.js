import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Grid } from '@databyss-org/ui/primitives'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/components/Editor/EditorProvider'
import reducer from '@databyss-org/ui/components/Editor/state/line/reducer'
import { getRawHtmlForBlock } from '@databyss-org/ui/components/Editor/state/page/reducer'
import SlateContentEditable from '@databyss-org/ui/components/Editor/slate/line/ContentEditable'
import slateReducer from '@databyss-org/ui/components/Editor/slate/line/reducer'
import EditorLine from '@databyss-org/ui/components/Editor/EditorLine'
import initialState from '@databyss-org/ui/components/Editor/state/__tests__/emptyInitialState'
import { ViewportDecorator } from '../decorators'
import colors from '../../theming/colors'

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="none" width="100%" {...others}>
    {children}
  </View>
)

const ProviderDecorator = storyFn => (
  <EditorProvider
    initialState={initialState}
    editableReducer={slateReducer}
    reducer={reducer}
  >
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
        <EditorLine>
          <SlateContentEditable onDocumentChange={setSlateDocument} />
        </EditorLine>
      </Box>
      <Box overflow="scroll" maxWidth="500px" flexShrink={1}>
        <pre>{JSON.stringify(slateDocument, null, 2)}</pre>
      </Box>
      <Box overflow="scroll" maxWidth="500px" flexShrink={1}>
        <pre>{JSON.stringify(editorDocument, null, 2)}</pre>
      </Box>
    </Grid>
  )
}

storiesOf('Editor//Slate Implementation', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Single Line', () => (
    <View
      css={{ '& ::selection': { backgroundColor: colors.selectionHighlight } }}
    >
      <SlateEditorDemo />
    </View>
  ))
