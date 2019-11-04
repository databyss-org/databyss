import React from 'react'
import reducer from '@databyss-org/ui/components/Editor/state/line/reducer'
import slateReducer from '@databyss-org/ui/components/Editor/slate/line/reducer'
import EditorProvider from '@databyss-org/ui/components/Editor/EditorProvider'
import { View } from '@databyss-org/ui/primitives'
import EditorLine from '@databyss-org/ui/components/Editor/EditorLine'
import SlateContentEditable from '@databyss-org/ui/components/Editor/slate/line/ContentEditable'

const SlateEditorDemo = ({ onStateChange, css, ...others }) => (
  <EditorLine onStateChange={onStateChange}>
    <SlateContentEditable css={css} {...others} />
  </EditorLine>
)

const RichTextInput = ({
  value,
  onStateChange,
  id,
  css,
  onBlur,
  ...others
}) => (
  <EditorProvider
    initialState={value}
    editableReducer={slateReducer}
    reducer={reducer}
  >
    <View>
      <SlateEditorDemo css={css} onStateChange={onStateChange} {...others} />
    </View>
  </EditorProvider>
)

RichTextInput.defaultProps = {
  variant: 'uiTextSmall',
  value: { textValue: '', ranges: [] },
  onStateChange: () => null,
  onDocumentChange: () => null,
  onBlur: () => null,
  onFocus: () => null,
}

export default RichTextInput
