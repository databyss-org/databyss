import React, { useRef, useEffect } from 'react'
import { useStateValue } from '@databyss-org/services/editor/ServiceProvider'
import { View } from '@databyss-org/ui/primitives'

import EditorBlocks from './EditorBlocks'
import EditorMenu from './EditorMenu'

const EditorProvider = () => {
  const [{ blocks, menu }, dispatch] = useStateValue()
  const contentEl = useRef(null)

  const logKey = e => {
    // detect keystrokes
    if (e.keyCode === 8) {
      dispatch({ type: 'BACKSPACE' })
    } else if (e.keyCode === 13) {
      dispatch({ type: 'NEW_LINE' })
    } else if (e.keyCode === 38) {
      setTimeout(() => dispatch({ type: 'UP' }), 50)
    } else if (e.keyCode === 40) {
      setTimeout(() => dispatch({ type: 'DOWN' }), 50)
    } else {
      // clear()
    }
  }

  useEffect(
    () => {
      if (contentEl.current instanceof Element) {
        contentEl.current.addEventListener('keydown', logKey)
        return () => {
          contentEl.current.removeEventListener('keydown', logKey)
        }
      }
    },
    [contentEl]
  )

  return (
    <div ref={contentEl}>
      <View borderVariant="thinLight" paddingVariant="small">
        <EditorBlocks data={blocks} />
        <EditorMenu data={menu} />
      </View>
    </div>
  )
}

export default EditorProvider
