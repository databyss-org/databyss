import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

const MenuItem = ({ text, ...others }) => (
  <View m={0} flex="none" {...others}>
    <View
      height={24}
      width={24}
      borderRadius="50%"
      bg="gray.6"
      alignItems="center"
      justifyContent="center"
    >
      <Text variant="uiTextNormal" color="gray.4">
        {text}
      </Text>
    </View>
  </View>
)

export default MenuItem
