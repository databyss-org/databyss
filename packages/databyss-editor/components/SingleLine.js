import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  forwardRef,
} from 'react'
import {
  Editable,
  withReact,
  Slate,
  ReactEditor,
} from '@databyss-org/slate-react'
import { Editor, createEditor, Transforms } from '@databyss-org/slate'
import { View, Text } from '@databyss-org/ui/primitives'
import { stateToSlateMarkup, getRangesFromBlock } from '../lib/markup'
import Hotkeys from './../lib/hotKeys'

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const Leaf = ({ variant, attributes, children, leaf }) => {
  const boldVariant = `${variant}Semibold`
  const italicVariant = `${variant}Italic`

  let styleProps = { variant }
  if (leaf.bold) {
    styleProps = { variant: boldVariant }
  }
  if (leaf.italic) {
    styleProps = { variant: italicVariant }
  }
  if (leaf.location) {
    styleProps = { color: 'text.3' }
  }

  return (
    <Text
      {...attributes}
      {...styleProps}
      minWidth="10px"
      display="inline-block"
    >
      {children}
    </Text>
  )
}

const RichText = forwardRef(
  (
    {
      multiline,
      active,
      onChange,
      initialValue,
      id,
      overrideCss,
      onBlur,
      onFocus,
      placeholder,
      variant,
    },
    ref
  ) => {
    // set initial value
    const initValue = (text) => [
      {
        children: stateToSlateMarkup({ text }),
      },
    ]

    const [value, setValue] = useState(initValue(initialValue))

    const renderLeaf = useCallback(
      (props) => <Leaf variant={variant} {...props} />,
      []
    )
    const editor = useMemo(() => withReact(createEditor()), [])

    const onChangeEvent = (value) => {
      if (onChange) {
        onChange(getRangesFromBlock(value))
      }
      setValue(value)
    }

    useEffect(() => {
      setValue(initValue(initialValue))
    }, [initialValue])

    useEffect(() => {
      if (active && editor) {
        ReactEditor.focus(editor)
        Transforms.select(editor, Editor.end(editor, []))
      }
    }, [active])

    return (
      <View ref={ref}>
        <Slate editor={editor} value={value} onChange={onChangeEvent}>
          <Editable
            css={overrideCss}
            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
            id={id}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            spellCheck
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()

                if (multiline) {
                  Transforms.insertText(editor, `\n`)
                }
              }

              if (Hotkeys.isBold(event)) {
                event.preventDefault()
                toggleMark(editor, 'bold')
              }

              if (Hotkeys.isItalic(event)) {
                toggleMark(editor, 'italic')
                event.preventDefault()
              }

              if (Hotkeys.isLocation(event)) {
                toggleMark(editor, 'location')
                event.preventDefault()
              }
            }}
            onBlur={onBlur}
            onFocus={onFocus}
          />
        </Slate>
      </View>
    )
  }
)

RichText.defaultProps = {
  variant: 'uiTextNormal',
}

export default RichText
