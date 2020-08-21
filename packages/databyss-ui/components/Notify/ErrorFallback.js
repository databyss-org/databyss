import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'
import {
  ResourceNotFoundError,
  NetworkUnavailableError,
  NotAuthorizedError,
  InsufficientPermissionError,
} from '@databyss-org/services/interfaces'

const ErrorFallback = ({ error, message, ...others }) => {
  let _message = message
  if (!_message && error) {
    if (error instanceof ResourceNotFoundError) {
      _message = 'not found'
    } else if (error instanceof NetworkUnavailableError) {
      _message = 'Network error'
    } else if (error instanceof NotAuthorizedError) {
      _message = 'Not Authorized, please log in'
    } else if (error instanceof InsufficientPermissionError) {
      _message = 'Not Authorized'
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
