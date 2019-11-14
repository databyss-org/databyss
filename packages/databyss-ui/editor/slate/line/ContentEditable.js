import React, { useRef, useEffect, forwardRef } from 'react'
import { Value } from 'slate'
import { Editor } from 'slate-react'
import { Text } from '@databyss-org/ui/primitives'
import Bugsnag from '@databyss-org/services/lib/bugsnag'
import { lineStateToSlate } from './../markup'
import { useEditorContext } from '../../EditorProvider'
import { formatHotKeys, navHotKeys } from './../hotKeys'
import { renderMark, getBlockRanges } from './../slateUtils'

const initalValue = node => ({
  document: {
    nodes: [node],
  },
})

function useCombinedRefs(...refs) {
  const targetRef = useRef()
  useEffect(
    () => {
      refs.forEach(ref => {
        if (!ref) return

        if (typeof ref === 'function') {
          ref(targetRef.current)
        } else {
          ref.current = targetRef.current
        }
      })
    },
    [refs]
  )
  return targetRef
}

const SlateContentEditable = forwardRef(
  (
    {
      onContentChange,
      onEditableStateChange,
      onNativeDocumentChange,
      OnToggleMark,
      onHotKey,
      onBlur,
      overrideCss,
      multiline,
    },
    ref
  ) => {
    const [editorState] = useEditorContext()

    const { editableState, textValue } = editorState

    const editableRef = useRef(null)

    // solution from https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
    const combinedRef = useCombinedRefs(ref, editableRef)

    // checks editor state for active block content changed
    const checkContentChanged = _nextEditableState => {
      // on first click on change returns null values for anchor block
      if (!_nextEditableState.value.anchorBlock) {
        return false
      }

      const _text = _nextEditableState.value.anchorBlock.text
      if (textValue !== _text) {
        const _ranges = getBlockRanges(_nextEditableState.value.anchorBlock)
        return { _text, _ranges }
      }

      return false
    }

    const onChange = change => {
      const { value } = change
      Bugsnag.client.leaveBreadcrumb('line/ContentEditable/onChange', {
        state: JSON.stringify(editorState, null, 2),
      })
      if (onNativeDocumentChange) {
        onNativeDocumentChange(value.document.toJSON())
      }
      const blockChanges = checkContentChanged({ value })
      if (blockChanges) {
        const { _text, _ranges } = blockChanges
        onContentChange(_text, _ranges, { value })
      } else {
        onEditableStateChange({ value })
      }
    }

    const _editableState = editableState || {
      value: Value.fromJSON(initalValue(lineStateToSlate(editorState))),
    }

    useEffect(
      () =>
        _editableState.editorCommands &&
        _editableState.editorCommands(
          editableRef.current,
          _editableState.value,
          () => editableRef.current.controller.flush()
        )
    )

    const onKeyDown = (event, editor, next) => {
      if (event.key === 'Enter') {
        editor.insertText('\n')
        return event.preventDefault()
      }
      navHotKeys(event, editor, onHotKey, OnToggleMark)

      formatHotKeys(event, editor, onHotKey, OnToggleMark)

      return next()
    }

    const renderLine = ({ children }) => (
      <Text
        variant="bodyNormal"
        color="text.0"
        css={multiline ? {} : { flexShrink: 0 }}
      >
        {children}
      </Text>
    )

    return (
      <Editor
        value={_editableState.value}
        autoFocus
        ref={combinedRef}
        onChange={onChange}
        onKeyDown={onKeyDown}
        renderMark={renderMark}
        renderBlock={renderLine}
        onBlur={onBlur}
        css={overrideCss}
      />
    )
  }
)

export default SlateContentEditable
