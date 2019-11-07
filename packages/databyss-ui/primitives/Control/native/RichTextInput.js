import React, { forwardRef } from 'react'
import reducer from '@databyss-org/ui/components/Editor/state/line/reducer'
import slateReducer from '@databyss-org/ui/components/Editor/slate/line/reducer'
import EditorProvider from '@databyss-org/ui/components/Editor/EditorProvider'
import EditorLine from '@databyss-org/ui/components/Editor/EditorLine'
import SlateContentEditable from '@databyss-org/ui/components/Editor/slate/line/ContentEditable'

const RichTextInput = forwardRef(
  ({ value, onChange, id, css, onBlur, multiline, ...others }, ref) => {
    const _onBlur = (event, editor, next) => {
      onBlur(event)
      setTimeout(() => editor.blur(), 50)
      next()
    }

    const styledCss = [css]

    const _css = [{ overflow: 'scroll' }, ...styledCss]

    const _children = (
      <EditorProvider
        initialState={value}
        editableReducer={slateReducer}
        reducer={reducer}
      >
        <EditorLine onChange={onChange}>
          <SlateContentEditable
            css={_css}
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
