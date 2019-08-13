import React from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import EditorEditor from './EditorEditor'

const EditorBlock = ({ symbol, text, ...others }) => {
  return (
    <Grid columnGap={1} mb={1} {...others}>
      <View width={1 / 12}>
        <Text variant="uiTextNormal" color="gray.4" textAlign="right">
          {symbol}
        </Text>
      </View>
      <View width={10 / 12}>
        <EditorEditor value={text} />
      </View>
    </Grid>
  )
}

export default EditorBlock
