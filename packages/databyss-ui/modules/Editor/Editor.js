import React, { useRef, useEffect } from 'react'
import { useProviderContext } from '@databyss-org/services/editor/EditorProvider'
import { View } from '@databyss-org/ui/primitives'

import EditorBlocks from './EditorBlocks'
import EditorMenu from './EditorMenu'

const Editor = () => {
  const [state, actions] = useProviderContext()
  const { blocks, menu } = state
  const { onBackspace, onNewLine, onUpKey, onDownKey } = actions

  const contentEl = useRef(null)

  const logKey = e => {
    // detect keystrokes
    if (e.keyCode === 8) {
      onBackspace()
    } else if (e.keyCode === 13) {
      onNewLine()
    } else if (e.keyCode === 38) {
      // console.log('GET STATE')
      setTimeout(() => onUpKey(), 50)
    } else if (e.keyCode === 40) {
      setTimeout(() => onDownKey(), 50)
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
    [contentEl, state]
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

export default Editor
