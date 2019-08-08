import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

const MenuItem = ({ item, k, ...others }) => (
  <View
    m={0}
    height={24}
    width={24}
    bg="gray.6"
    borderRadius="50%"
    alignItems="center"
    justifyContent="center"
    {...others}
  >
    <Text variant="uiTextNormal" color="gray.4">
      {item.text}
    </Text>
  </View>
)

export default MenuItem
