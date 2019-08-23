import React, { useRef, useEffect } from 'react'
import {
  getInnerTextForBlock,
  getSelectedId,
  getCaretPosition,
  setCaretPos,
  inKeyWhitelist,
} from './../../lib/dom'

const ContentEditable = ({
  children,
  activeBlockId,
  onActiveBlockChange,
  onActiveBlockIdChange,
  caretPosition,
  onCaretPositionChange,
}) => {
  const editorRef = useRef(null)
  const caretPositionRef = useRef(caretPosition)

  useEffect(
    () => {
      caretPositionRef.current = caretPosition
    },
    [caretPosition]
  )

  const fixCaretPosition = () => {
    //  console.log('caret should be at ', caretPositionRef.current)
    const _caretPosition = getCaretPosition()
    //  console.log('caret is at', _caretPosition)

    if (caretPositionRef.current !== _caretPosition) {
      setCaretPos(caretPositionRef.current)
    }
  }

  // const onSelectChange = e => {
  //   const _selectedBlockId = getSelectedId(e)

  //   onActiveBlockIdChange(_selectedBlockId)
  // }

  // useEffect(
  //   () => {
  //     if (editorRef.current) {
  //       document.addEventListener('selectionchange', onSelectChange)
  //     }
  //     return () => {
  //       console.log('removeEventListener')
  //       document.removeEventListener('selectionchange', onSelectChange)
  //     }
  //   },
  //   [editorRef]
  // )

  const onInput = () => {
    onActiveBlockChange(getInnerTextForBlock(activeBlockId))
  }

  const onKeyDown = e => {
    if (!inKeyWhitelist(e)) {
      e.preventDefault()
      onActiveBlockChange(e.key)
    }
  }

  const onClick = e => {
    const _caretPostion = getCaretPosition()
    onCaretPositionChange(_caretPostion)
    const _selectedBlockId = getSelectedId(e)
    if (_selectedBlockId) {
      onActiveBlockIdChange(_selectedBlockId)
    }
  }

  useEffect(() => {
    fixCaretPosition()
  })

  return (
    <div
      contentEditable="true"
      ref={editorRef}
      onKeyDown={e => onKeyDown(e)}
      onClick={e => onClick(e)}
      suppressContentEditableWarning
    >
      {children}
    </div>
  )
}

export default ContentEditable
