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

  const checkSelectedBlock = () => {
    // selector should accept a wider area to click on
    // returns null if no id is found

    const _selectedBlockId = findSelectedBlockId()
    if (_selectedBlockId !== stateRef.current.activeBlockId)
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
    checkSelectedBlock()
  }
  const onKeyUpEvent = e => {
    if (!inKeyWhitelist(e)) {
      return
    }
    checkSelectedBlock()
  }

  const onClick = () => {
    checkSelectedBlock()
  }

  return (
    <div
      role="textbox"
      contentEditable="true"
      tabIndex="0"
      onKeyDown={e => onKeyDownEvent(e)}
      onKeyUp={e => onKeyUpEvent(e)}
      onClick={() => onClick()}
      suppressContentEditableWarning
    >
      {children}
    </div>
  )
}

export default ContentEditable
