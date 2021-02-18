import React from 'react'
import { View } from '@databyss-org/ui/primitives'
import { ErrorText } from './ErrorText'

const ErrorFallback = ({ error, message, ...others }) => (
  <View
    alignSelf="center"
    justifyContent="center"
    height="100%"
    flexShrink={1}
    {...others}
  >
    <ErrorText error={error} message={message} />
  </View>
)

export default ErrorFallback
