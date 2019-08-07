import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

const EditorSymbol = ({ value }) => {
  return (
    <Text variant="uiTextNormal" color="gray.4" textAlign="right">
      {value}
    </Text>
  )
}

export default EditorSymbol
