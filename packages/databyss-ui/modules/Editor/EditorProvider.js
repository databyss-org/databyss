import React from 'react'
import { useStateValue } from '@databyss-org/services/editor/ServiceProvider'
import { View } from '@databyss-org/ui/primitives'
import EditorBlocks from './EditorBlocks'
import EditorMenu from './EditorMenu'

const EditorProvider = () => {
  const [{ blocks, menu }] = useStateValue()

  return (
    <View borderVariant="thinLight" paddingVariant="small">
      <EditorBlocks data={blocks} />
      <EditorMenu data={menu} />
    </View>
  )
}

export default EditorProvider
