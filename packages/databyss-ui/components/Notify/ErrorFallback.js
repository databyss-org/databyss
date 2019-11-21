import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

const ErrorFallback = ({ message, ...others }) => (
  <View alignSelf="center" justifyContent="center" {...others}>
    <Text>{message}</Text>
  </View>
)

export default ErrorFallback
