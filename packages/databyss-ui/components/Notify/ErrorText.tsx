import React from 'react'
import { Text, TextProps } from '@databyss-org/ui/primitives'
import {
  ResourceNotFoundError,
  NetworkUnavailableError,
  NotAuthorizedError,
  InsufficientPermissionError,
} from '@databyss-org/services/interfaces'

interface ErrorTextProps extends TextProps {
  error?: Error
  message?: string
}

export const ErrorText = ({ error, message, ...others }: ErrorTextProps) => {
  let _message = message
  if (!_message && error) {
    if (error instanceof ResourceNotFoundError) {
      _message = 'Resource not found. How about a nice game of chess?'
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
    throw error || new Error('Unexpected error')
  }

  return <Text {...others}>{_message}</Text>
}

export default ErrorText
