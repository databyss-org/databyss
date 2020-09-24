import React, { forwardRef } from 'react'
import SingleLine from '@databyss-org/editor/components/SingleLine'

const RichTextInput = forwardRef(
  (
    { value, onChange, id, concatCss, onBlur, onFocus, active, multiline },
    ref
  ) => {
    const _onBlur = event => {
      onBlur(event)
    }

    const _onFocus = event => {
      onFocus(event)
    }

    const _css = [
      {
        display: 'flex',
        overflowY: 'auto',
        ...(!multiline ? { '::-webkit-scrollbar': { display: 'none' } } : {}),
      },
    ].concat(concatCss)

    return (
      <SingleLine
        onFocus={_onFocus}
        active={active}
        onBlur={_onBlur}
        multiline={multiline}
        onChange={onChange}
        initialValue={value}
        id={id}
        overrideCss={_css}
        name="RichTextInput"
        ref={ref}
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
