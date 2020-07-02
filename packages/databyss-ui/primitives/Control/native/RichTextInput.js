import React, { forwardRef, useEffect, useRef } from 'react'
import { ReactEditor } from 'slate-react'
import { Editor, Transforms } from '@databyss-org/slate'
import SingleLine from '@databyss-org/editor/components/SingleLine'

const RichTextInput = forwardRef(
  (
    { value, onChange, id, concatCss, onBlur, onFocus, active, multiline },
    ref
  ) => {
    const editorRef = useRef(null)

    const _onBlur = event => {
      onBlur(event)
    }

    useEffect(
      () => {
        if (active && editorRef.current) {
          ReactEditor.focus(editorRef.current)
          Transforms.select(
            editorRef.current,
            Editor.end(editorRef.current, [])
          )
        }
      },
      [active]
    )

    const _onFocus = event => {
      onFocus(event)
    }

    const _css = [
      {
        display: 'flex',
        overflow: 'scroll',
        ...(!multiline ? { '::-webkit-scrollbar': { display: 'none' } } : {}),
      },
    ].concat(concatCss)

    const setEditor = editor => {
      editorRef.current = editor
    }

    return (
      <SingleLine
        onFocus={_onFocus}
        onBlur={_onBlur}
        multiline={multiline}
        onChange={onChange}
        initialValue={value}
        id={id}
        overrideCss={_css}
        name="RichTextInput"
        ref={ref}
        setEditor={setEditor}
      />
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
