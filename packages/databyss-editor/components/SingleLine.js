import React, { useCallback, useMemo, useState } from 'react'
import isHotkey from 'is-hotkey'
import { Editable, withReact, Slate } from 'slate-react'
import { Editor, createEditor } from 'slate'
import { View, Text } from '@databyss-org/ui/primitives'

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

const initialValue = [
  {
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ', bold: true, italic: true },
      { text: 'location ', location: true },
      { text: 'all', location: true, bold: true, italic: true },

      { text: '!' },
    ],
  },
]

const RichText = ({ multiline, onChange }) => {
  const [value, setValue] = useState(initialValue)

  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(() => withReact(createEditor()), [])

  const onChangeEvent = value => {
    console.log(value)
    setValue(value)
  }
  return (
    <Slate editor={editor} value={value} onChange={onChangeEvent}>
      <Editable
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault()
              const mark = HOTKEYS[hotkey]
              toggleMark(editor, mark)
            }
          }
        }}
      />
    </Slate>
  )
}

export default RichText
