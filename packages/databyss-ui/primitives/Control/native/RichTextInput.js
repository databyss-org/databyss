import React, { forwardRef } from 'react'
import reducer from '@databyss-org/ui/editor/state/line/reducer'
import slateReducer from '@databyss-org/ui/editor/slate/line/reducer'
import EditorProvider from '@databyss-org/ui/editor/EditorProvider'
import EditorLine from '@databyss-org/ui/editor/EditorLine'
import SlateContentEditable from '@databyss-org/ui/editor/slate/line/ContentEditable'

const RichTextInput = forwardRef(
  ({ value, onChange, id, concatCss, onBlur, multiline, ...others }, ref) => {
    const _onBlur = (event, editor, next) => {
      onBlur(event)
      setTimeout(() => editor.blur(), 50)
      next()
    }

    const _css = [
      {
        display: 'flex',
        overflow: 'scroll',
        ...(!multiline ? { '::-webkit-scrollbar': { display: 'none' } } : {}),
      },
    ].concat(concatCss)

    return (
      <EditorProvider
        initialState={value}
        editableReducer={slateReducer}
        reducer={reducer}
      >
        <EditorLine onChange={onChange}>
          <SlateContentEditable
            id={id}
            overrideCss={_css}
            onBlur={_onBlur}
            multiline={multiline}
            {...others}
            ref={ref}
          />
        </EditorLine>
      </EditorProvider>
    )
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
