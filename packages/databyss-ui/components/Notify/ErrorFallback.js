import React from 'react'
import { Text, View } from '@databyss-org/ui/primitives'
import {
  ResourceNotFoundError,
  NetworkUnavailableError,
  NotAuthorizedError,
} from '@databyss-org/services/lib/errors'

const ErrorFallback = ({ error, message, ...others }) => {
  let _message = message
  if (!_message && error) {
    if (error instanceof ResourceNotFoundError) {
      _message = 'not found'
    } else if (error instanceof NetworkUnavailableError) {
      _message = 'Network error'
    } else if (error instanceof NotAuthorizedError) {
      _message = 'Not Authorized, please log in'
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
