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

const Leaf = ({ attributes, children, leaf }) => {
  let _children =
    leaf.bold || leaf.italic || leaf.location ? (
      children
    ) : (
      <Text display="inline">{children}</Text>
    )

  if (leaf.bold) {
    _children = (
      <Text display="inline" variant="bodyNormalSemibold">
        {_children}
      </Text>
    )
  }

  if (leaf.italic) {
    _children = (
      <Text display="inline" variant="bodyNormalItalic">
        {_children}
      </Text>
    )
  }

  if (leaf.location) {
    _children = (
      <View {...attributes} color="text.3" display="inline" borderRadius={0}>
        {_children}
      </View>
    )
  }

  return (
    <View display="inline" {...attributes}>
      {_children}
    </View>
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
    },
    ref
  ) => {
    // set initial value

    const initValue = [
      {
        children: stateToSlateMarkup({ text: initialValue }),
      },
    ]

    const [value, setValue] = useState(initValue)

    const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    const editor = useMemo(() => withReact(createEditor()), [])

    const onChangeEvent = value => {
      if (onChange) {
        onChange(getRangesFromBlock(value))
      }
      setValue(value)
    }

    useEffect(
      () => {
        if (active && editor) {
          ReactEditor.focus(editor)
          Transforms.select(editor, Editor.end(editor, []))
        }
      },
      [active]
    )

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
            onKeyDown={event => {
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

export default RichText
