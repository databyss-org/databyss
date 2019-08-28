import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import { View, Button } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/components/Editor/EditorProvider'
import { setActiveBlockType } from '@databyss-org/ui/components/Editor/state/actions'
import SlateContentEditable from '@databyss-org/ui/components/Editor/SlateContentEditable'
import slateReducer from '@databyss-org/ui/components/Editor/state/slateReducer'
import EditorPage from '@databyss-org/ui/components/Editor/EditorPage'
import initialState from '@databyss-org/ui/components/Editor/state/__tests__/initialState'
import { ViewportDecorator } from '../decorators'

const SlateDemo = () => {
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
  const initialValue = Value.fromJSON({
    document: {
      nodes: [
        {
          object: 'block',
          type: 'ENTRY',
          id: '23984723ijhrkjsdhf',
          nodes: [
            {
              object: 'text',
              text: 'A line of text in a paragraph.',
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

  return <Editor value={slateValue} onChange={onChange} schema={schema} />
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
  <EditorProvider initialState={initialState} editableReducer={slateReducer}>
    {storyFn()}
  </EditorProvider>
)

storiesOf('Editor//Slate Implementation', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Slate', () => (
    <Box>
      <SlateDemo />
    </Box>
  ))
  .add('EditorPage', () => (
    <View>
      <ToolbarDemo />
      <Box>
        <EditorPage>
          <SlateContentEditable />
        </EditorPage>
      </Box>
    </View>
  ))
