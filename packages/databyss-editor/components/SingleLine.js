import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  forwardRef,
  useRef,
} from 'react'
import isHotkey from 'is-hotkey'
import { Editable, withReact, Slate, ReactEditor } from 'slate-react'
import { Editor, createEditor, Transforms } from 'slate'
import { View, Text } from '@databyss-org/ui/primitives'
import { stateToSlateMarkup, getRangesFromBlock } from '../lib/markup'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+k': 'location',
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
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
      <View
        {...attributes}
        borderBottom="1px dashed"
        borderColor="text.4"
        display="inline"
        borderRadius={0}
      >
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
  ({ multiline, onChange, initialValue, id, overrideCss, onBlur }, ref) => {
    const _el = useRef(ref)
    // set initial value

    const initValue = [
      {
        children: stateToSlateMarkup(initialValue),
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

    return (
      <View ref={ref}>
        <Slate editor={editor} value={value} onChange={onChangeEvent}>
          <Editable
            css={overrideCss}
            id={id}
            renderLeaf={renderLeaf}
            placeholder="Enter some rich text…"
            spellCheck
            autoFocus
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()

                if (multiline) {
                  Transforms.insertText(editor, `\n`)
                }
              }
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault()
                  const mark = HOTKEYS[hotkey]
                  toggleMark(editor, mark)
                }
              }
            }}
            onBlur={onBlur}
          />
        </Slate>
      </View>
    )
  }
)

export default RichText
