import React, { useState } from 'react'
import Grid from '@databyss-org/ui/components/Grid/Grid'
import { Text, View } from '@databyss-org/ui/primitives'
import { useStateValue } from '@databyss-org/services/components/ServiceProvider'
import EditorEditor from './EditorEditor'
import TextArea from './TextArea'

const ActiveBlock = ({ symbol, text, ...others }) => {
  const [{ blockState }, dispatch] = useStateValue()

  console.log(blockState)
  return (
    <Grid columnGap={1} mb={1} {...others}>
      <View width={1 / 12}>
        <Text variant="uiTextNormal" color="gray.4" textAlign="right">
          {symbol}
        </Text>
      </View>
      <View width={10 / 12}>
        <TextArea blockState={blockState} dispatch={dispatch} />
      </View>
    </Grid>
  )
}

export default ActiveBlock
