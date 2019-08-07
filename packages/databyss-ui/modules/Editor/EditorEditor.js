import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

const EditorEditor = ({ value }) => {
  return (
    <View>
      <Text variant="BodyNormal">{value}</Text>
    </View>
  )
}

export default EditorEditor
