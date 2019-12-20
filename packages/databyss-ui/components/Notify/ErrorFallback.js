import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'
import { ResourceNotFoundError } from '@databyss-org/services/lib/ResourceNotFoundError'
import { NetworkUnavailableError } from '@databyss-org/services/lib/NetworkUnavailableError'

const ErrorFallback = ({ error, message, ...others }) => {
  let _message = message
  if (!_message && error) {
    if (error instanceof ResourceNotFoundError) {
      _message = 'Source not found'
    } else if (error instanceof NetworkUnavailableError) {
      _message = 'Please connect to the internet to use this feature'
    }
  }

  if (!_message) {
    // throw to the source to trigger the "unexpected error" dialog
    throw error
  }

  return (
    <View alignSelf="center" justifyContent="center" {...others}>
      <Text>{_message}</Text>
    </View>
  )
}

export default ErrorFallback
