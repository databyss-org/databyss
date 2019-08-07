import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import EditorSymbol from './EditorSymbol'
import EditorEditor from './EditorEditor'

const EditorBlock = ({ symbol, text }) => {
  return (
    <Grid columnGap={1} mb={1}>
      <View width={1 / 12}>
        <EditorSymbol value={symbol} />
      </View>
      <View width={10 / 12}>
        <EditorEditor value={text} />
      </View>
    </Grid>
  )
}

export default EditorBlock
