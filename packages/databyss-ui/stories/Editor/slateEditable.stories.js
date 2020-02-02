import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import {
  View,
  Button,
  Grid,
  List,
  Separator,
} from '@databyss-org/ui/primitives'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/editor/EditorProvider'
import reducer, {
  getRawHtmlForBlock,
} from '@databyss-org/ui/editor/state/page/reducer'
import { setActiveBlockType } from '@databyss-org/ui/editor/state/page/actions'
import SlateContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import initialState from '@databyss-org/ui/editor/state/__tests__/initialState'
import NavigationProvider from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { ViewportDecorator } from '../decorators'
import colors from '../../theming/colors'

const schema = {
  document: {
    nodes: [
      {
        match: [{ type: 'ENTRY' }],
      },
    ],
  },
  blocks: {
    ENTRY: {
      nodes: [
        {
          match: { object: 'text' },
        },
      ],
    },
  },
}

const SlateDemo = ({ initialString }) => {
  const initialValue = Value.fromJSON({
    document: {
      nodes: [
        {
          object: 'block',
          type: 'ENTRY',
          nodes: [
            {
              object: 'text',
              text: initialString,
            },
          ],
        },
      ],
    },
  })
  const [slateValue, setSlateValue] = useState(initialValue)

  const onChange = ({ value }) => {
    setSlateValue(value)
  }

  return (
    <Editor
      value={slateValue}
      onChange={onChange}
      schema={schema}
      onBlur={() => console.log('onblur')}
    />
  )
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

const Box = ({ children, ...others }) => (
  <View borderVariant="thinDark" paddingVariant="none" width="100%" {...others}>
    {children}
  </View>
)

const ProviderDecorator = storyFn => (
  <NavigationProvider>
    <EditorProvider
      initialState={initialState}
      editableReducer={slateReducer}
      reducer={reducer}
    >
      {storyFn()}
    </EditorProvider>
  </NavigationProvider>
)

const SlateEditorDemo = () => {
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
      <Box mb="medium" maxWidth="500px" flexShrink={1}>
        <EditorPage>
          <SlateContentEditable onDocumentChange={setSlateDocument} />
        </EditorPage>
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
  .add('Slate', () => (
    <Box>
      <SlateDemo />
    </Box>
  ))
  .add('Multiple Slates', () => (
    <Box>
      <List verticalItemPadding="small">
        <SlateDemo initialString="Editor one" />
        <Separator spacing="small" />
        <SlateDemo initialString="Editor two" />
      </List>
    </Box>
  ))
  .add('EditorPage', () => (
    <View
      css={{ '& ::selection': { backgroundColor: colors.selectionHighlight } }}
    >
      <ToolbarDemo />
      <SlateEditorDemo />
    </View>
  ))
