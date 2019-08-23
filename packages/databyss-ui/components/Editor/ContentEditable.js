import React, { useRef, useEffect } from 'react'

import {
  findSelectedBlockId,
  getCaretPosition,
  setCaretPosition,
  inKeyWhitelist,
} from './../../lib/dom'

const ContentEditable = ({
  children,
  activeBlockId,
  caretPosition,
  onActiveBlockIdChange,
  onKeyDown,
}) => {
  const stateRef = useRef({ caretPosition, activeBlockId })

  useEffect(
    () => {
      Object.assign(stateRef.current, { caretPosition, activeBlockId })
    },
    [caretPosition, activeBlockId]
  )

  const checkSelectedBlock = e => {
    // selector should accept a wider area to click on
    // returns null if no id is found
    const _selectedBlockId = findSelectedBlockId(e)
    if (_selectedBlockId !== stateRef.current.activeBlockId && _selectedBlockId)
      onActiveBlockIdChange(_selectedBlockId)
  }

  const caretPositionNeedsFixing = () => {
    const _caretPosition = getCaretPosition()

    return stateRef.current.caretPosition !== _caretPosition
  }

  useEffect(() => {
    if (caretPositionNeedsFixing()) {
      setCaretPosition(stateRef.current.caretPosition)
    }
  })

  const onKeyDownEvent = e => {
    if (!inKeyWhitelist(e)) {
      e.preventDefault()
      onKeyDown(e.key)
      return
    }
    checkSelectedBlock(e)
  }

  const onClick = e => {
    checkSelectedBlock(e)
  }

  return (
    <div
      role="application"
      contentEditable="true"
      onKeyDown={e => onKeyDownEvent(e)}
      onClick={e => onClick(e)}
      suppressContentEditableWarning
    >
      {children}
    </div>
  )
}

export default ContentEditable
