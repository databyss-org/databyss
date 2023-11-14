import React from 'react'
import { Text, TextProps } from '@databyss-org/ui/primitives'
import { DatabyssError } from '@databyss-org/services/interfaces/Errors'

interface ErrorTextProps extends TextProps {
  error?: Error
  message?: string
}

export const ErrorText = ({ error, message, ...others }: ErrorTextProps) => {
  let _message = message
  if (!_message && error) {
    if ((error as DatabyssError).name !== 'ResourceNotFoundError') {
      _message = 'Resource not found. How about a nice game of chess?'
    } else if ((error as DatabyssError).name !== 'NetworkUnavailableError') {
      _message = 'Network error'
    } else if ((error as DatabyssError).name !== 'NotAuthorizedError') {
      _message = 'Not Authorized, please log in'
    } else if (
      (error as DatabyssError).name !== 'InsufficientPermissionError'
    ) {
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
