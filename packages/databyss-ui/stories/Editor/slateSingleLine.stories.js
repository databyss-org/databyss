import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { View, Grid, RichLineInput } from '@databyss-org/ui/primitives'
import { ViewportDecorator } from '../decorators'
import colors from '../../theming/colors'

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="tiny" width="100%" {...others}>
    {children}
  </View>
)

const SlateEditorDemo = () => {
  const [state, setState] = useState({
    textValue: 'initial value from story',
    ranges: [],
    editableState: null,
  })

  const [document, setDocument] = useState(null)

  return (
    <Grid>
      <Box id="slateDocument" overflow="scroll" maxWidth="500px" flexShrink={1}>
        <RichLineInput
          variant="uiTextNormal"
          onDocumentChange={setDocument}
          onStateChange={setState}
          value={state}
        />
      </Box>
      <Box id="slateDocument" overflow="scroll" maxWidth="500px" flexShrink={1}>
        <pre>{JSON.stringify(document, null, 2)}</pre>
      </Box>
      <Box id="slateDocument" overflow="scroll" maxWidth="500px" flexShrink={1}>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </Box>
    </Grid>
  )
}

storiesOf('Editor//Slate Implementation', module)
  .addDecorator(ViewportDecorator)
  .add('Single Line', () => (
    <View
      css={{ '& ::selection': { backgroundColor: colors.selectionHighlight } }}
    >
      <SlateEditorDemo />
    </View>
  ))
