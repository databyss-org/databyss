import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

const ErrorFallback = ({ message }) => (
  <View
    borderVariant="thinDark"
    paddingVariant="tiny"
    width="100%"
    height="100%"
    alignSelf="center"
    justifyContent="center"
  >
    <View alignSelf="center" justifyContent="center">
      <Text>{message}</Text>
    </View>
  </View>
)

export default ErrorFallback
