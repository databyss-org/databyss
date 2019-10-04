import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import {
  View,
  Button,
  MenuTagButton,
  SidebarButton,
  Icon,
} from '@databyss-org/ui/primitives'
import Grid from '@databyss-org/ui/components/Grid/Grid'
// import Close from '@databyss-org/ui/assets/close-menu.svg'
import buttons from '@databyss-org/ui/theming/buttons'
import EditorProvider, {
  useEditorContext,
} from '@databyss-org/ui/components/Editor/EditorProvider'
import { getRawHtmlForBlock } from '@databyss-org/ui/components/Editor/state/reducer'
import SlateContentEditable from '@databyss-org/ui/components/Editor/slate/ContentEditable'
import slateReducer from '@databyss-org/ui/components/Editor/slate/reducer'
import EditorPage from '@databyss-org/ui/components/Editor/EditorPage'
import initialState from '@databyss-org/ui/components/Editor/state/__tests__/initialState'
import { ViewportDecorator } from '../decorators'
import colors from '../../theming/colors'

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
  const [, setSlateDocument] = useState({})

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
      <SlateEditorDemo />
    </View>
  ))
