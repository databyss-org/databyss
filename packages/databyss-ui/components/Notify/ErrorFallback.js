import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

const ErrorFallback = ({ message }) => (
  <View
    borderVariant="thinDark"
    paddingVariant="tiny"
    width={300}
    height={200}
    alignSelf="center"
    justifyContent="center"
  >
    <View alignSelf="center" justifyContent="center">
      <Text>{message}</Text>
    </View>
  </View>
)

export default ErrorFallback
