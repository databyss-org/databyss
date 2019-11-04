import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Grid } from '@databyss-org/ui/primitives'
import EditorProvider, { useEditorContext } from '../../EditorProvider'
import EditorPage from '../../EditorPage'
import ContentEditable from '../page/ContentEditable'
import reducer, { getRawHtmlForBlock } from '../../state/page/reducer'
import initialState from '../../state/__tests__/initialState'
import emptyInitialState from '../../state/__tests__/emptyInitialState'

import slateReducer from '../page/reducer'
import { ViewportDecorator } from '../../../../stories/decorators'

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const EditableTest = () => {
  const [slateDocument, setSlateDocument] = useState({})
  const [editorState] = useEditorContext()
  const { activeBlockId, page, blocks } = editorState

  const editorDocument = {
    activeBlockId,
    pageBlocks: page.blocks.map(block => ({
      ...blocks[block._id],
      text: getRawHtmlForBlock(editorState, blocks[block._id]),
    })),
  }

  return (
    <Grid>
      <Box mb="medium" pt="medium" maxWidth="500px" flexShrink={1}>
        <EditorPage>
          <ContentEditable onDocumentChange={setSlateDocument} />
        </EditorPage>
      </Box>
      <Box id="slateDocument" overflow="scroll" maxWidth="500px" flexShrink={1}>
        <pre>{JSON.stringify(slateDocument, null, 2)}</pre>
      </Box>
      <Box id="pageBlocks" overflow="scroll" maxWidth="500px" flexShrink={1}>
        <pre>{JSON.stringify(editorDocument, null, 2)}</pre>
      </Box>
    </Grid>
  )
}

storiesOf('Editor//Tests', module)
  .addDecorator(ViewportDecorator)
  .add('Slate', () => (
    <EditorProvider
      initialState={initialState}
      editableReducer={slateReducer}
      reducer={reducer}
    >
      <EditableTest />
    </EditorProvider>
  ))
  .add('Slate - Empty', () => (
    <EditorProvider
      initialState={emptyInitialState}
      editableReducer={slateReducer}
      reducer={reducer}
    >
      <EditableTest />
    </EditorProvider>
  ))
