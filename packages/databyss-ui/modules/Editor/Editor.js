import React, { useRef, useEffect } from 'react'
import { View } from '@databyss-org/ui/primitives'
import { useProviderContext } from './EditorProvider'
import { onBackspace, onNewLine, onUpKey, onDownKey } from './actions/actions'

import EditorBlocks from './EditorBlocks'
import EditorMenu from './EditorMenu'

const Editor = () => {
  const [state, dispatch] = useProviderContext()
  const { blocks, menu } = state

  const contentEl = useRef(null)

  const logKey = e => {
    // detect keystrokes
    if (e.keyCode === 8) {
      dispatch(onBackspace())
    } else if (e.keyCode === 13) {
      dispatch(onNewLine())
    } else if (e.keyCode === 38) {
      // console.log('GET STATE')
      setTimeout(() => dispatch(onUpKey()), 50)
    } else if (e.keyCode === 40) {
      setTimeout(() => dispatch(onDownKey()), 50)
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
      return () => null
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

export default Editor
