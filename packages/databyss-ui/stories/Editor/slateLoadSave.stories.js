import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import { View, Button } from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/components/Editor/EditorProvider'
import {
  loadPage,
  savePage,
} from '@databyss-org/ui/components/Editor/state/actions'
import SlateContentEditable from '@databyss-org/ui/components/Editor/SlateContentEditable'
import slateReducer from '@databyss-org/ui/components/Editor/state/slateReducer'
import EditorPage from '@databyss-org/ui/components/Editor/EditorPage'
import initialState from '@databyss-org/ui/components/Editor/state/__tests__/initialState'
import { ViewportDecorator } from '../decorators'

const POST_EXAMPLE = {
  sources: {
    '5d6831c0c92fbc0022c43ef8': {
      _id: '5d6831c0c92fbc0022c43ef8',
      rawHtml: 'Staminov, Lev. Conscious and Embodiment',
    },
  },
  entries: {
    '5d6831b3c30e221abc6963e1': {
      _id: '5d6831b3c30e221abc6963e1',
      rawHtml: 'Mind as homunculus ins body',
    },
  },
  blocks: {
    '5d68319fc359221a1976e3cb': {
      type: 'SOURCE',
      _id: '5d68319fc359221a1976e3cb',
      refId: '5d6831c0c92fbc0022c43ef8',
    },
    '5d6831a7d150d68ba2042327': {
      type: 'ENTRY',
      _id: '5d6831a7d150d68ba2042327',
      refId: '5d6831b3c30e221abc6963e1',
    },
  },
  page: {
    _id: '5d68319118abb190de5e1417',
    name: 'pauls document',
    blocks: [
      {
        _id: '5d68319fc359221a1976e3cb',
      },
      {
        _id: '5d6831a7d150d68ba2042327',
      },
    ],
  },
}

const ToolbarDemo = () => {
  const [state, dispatch] = useEditorContext()
  console.log(state)

  return (
    <Grid mb="medium">
      <View>
        <Button onPress={() => dispatch(loadPage())}>LOAD</Button>
      </View>
      <View>
        <Button onPress={() => dispatch(savePage(state))}>SAVE</Button>
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

storiesOf('Editor//Save and Load', module)
  .addDecorator(ProviderDecorator)
  .addDecorator(ViewportDecorator)
  .add('Slate Load and Save', () => (
    <View>
      <ToolbarDemo />
      <Box>
        <EditorPage>
          <SlateContentEditable />
        </EditorPage>
      </Box>
    </View>
  ))
