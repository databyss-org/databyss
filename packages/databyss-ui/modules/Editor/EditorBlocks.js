import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import EditorBlock from './EditorBlock'
import ActiveBlock from './ActiveBlock'
import { menuAction } from './_helpers'

const EditorBlocks = ({ data }) => {
  let blocks = data.map((i, k) => {
    const item = menuAction(i)
    return <EditorBlock symbol={item.text} text={i.data} key={k} />
  })
  blocks = blocks.concat(<ActiveBlock symbol={'*'} key={data.length} />)
  return <View>{blocks}</View>
}

export default EditorBlocks
