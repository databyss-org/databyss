import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'

const ErrorFallback = ({ message }) => (
  <View height="100%">
    <View alignSelf="center" justifyContent="center">
      <Text>{message}</Text>
    </View>
  </View>
)

export default ErrorFallback
