import React, { forwardRef } from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import { Text } from '../../'

const TextInput = forwardRef(
  ({ value, onChange, id, css, onBlur, ...others }, ref) => {
    const _value = value.editorValue
      ? value.editorValue
      : Value.fromJSON({
          document: {
            nodes: [
              {
                object: 'block',
                type: 'TEXT',
                id,
                nodes: [
                  {
                    object: 'text',
                    text: value.textValue,
                  },
                ],
              },
            ],
          },
        })

    const _onChange = change => {
      onChange({
        editorValue: change.value,
        textValue: change.value.document.text,
      })
    }
    const _onBlur = (event, editor, next) => {
      onBlur(event)
      setTimeout(() => editor.blur(), 50)
      next()
    }

    return (
      <Editor
        tabIndex={0}
        value={_value}
        onChange={_onChange}
        ref={ref}
        css={css}
        onBlur={_onBlur}
        renderBlock={({ children }) => <Text {...others}>{children}</Text>}
      />
    )
  }
)

TextInput.defaultProps = {
  variant: 'uiTextSmall',
  onChange: () => null,
  onBlur: () => null,
  onFocus: () => null,
}

export default TextInput
