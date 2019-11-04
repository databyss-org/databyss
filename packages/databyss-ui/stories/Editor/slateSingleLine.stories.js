import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Grid } from '@databyss-org/ui/primitives'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/components/Editor/EditorProvider'
import reducer, {
  initialState,
} from '@databyss-org/ui/components/Editor/state/line/reducer'
import SlateContentEditable from '@databyss-org/ui/components/Editor/slate/line/ContentEditable'
import slateReducer from '@databyss-org/ui/components/Editor/slate/line/reducer'
import EditorLine from '@databyss-org/ui/components/Editor/EditorLine'
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
  const { textValue, ranges } = editorState

  const editorDocument = {
    textValue,
    ranges,
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
