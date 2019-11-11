import React, { forwardRef } from 'react'
import reducer from '@databyss-org/ui/Editor/state/line/reducer'
import slateReducer from '@databyss-org/ui/Editor/slate/line/reducer'
import EditorProvider from '@databyss-org/ui/Editor/EditorProvider'
import EditorLine from '@databyss-org/ui/Editor/EditorLine'
import SlateContentEditable from '@databyss-org/ui/Editor/slate/line/ContentEditable'

const RichTextInput = forwardRef(
  ({ value, onChange, id, concatCss, onBlur, multiline, ...others }, ref) => {
    const _onBlur = (event, editor, next) => {
      onBlur(event)
      setTimeout(() => editor.blur(), 50)
      next()
    }

    const _css = [{ overflow: 'scroll' }].concat(concatCss)
    const _children = (
      <EditorProvider
        initialState={value}
        editableReducer={slateReducer}
        reducer={reducer}
      >
        <EditorLine onChange={onChange}>
          <SlateContentEditable
            overrideCss={_css}
            onBlur={_onBlur}
            {...others}
            ref={ref}
          />
        </EditorLine>
      </EditorProvider>
    )

    return _children
  }
)

RichTextInput.defaultProps = {
  variant: 'uiTextSmall',
  value: { textValue: '', ranges: [] },
  onChange: () => null,
  onNativeDocumentChange: () => null,
  onBlur: () => null,
  onFocus: () => null,
}

export default RichTextInput
