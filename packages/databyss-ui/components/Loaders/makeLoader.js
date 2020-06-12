import React, { useEffect } from 'react'
import { ResourcePending } from '@databyss-org/services/lib/ResourcePending'
import ErrorFallback from '../Notify/ErrorFallback'
import Loading from '../Notify/LoadingFallback'

const makeLoader = ({ resource, children, onComponentUnmount }) => {
  useEffect(
    () => () => {
      if (
        resource &&
        !(resource instanceof ResourcePending) &&
        !(resource instanceof Error) &&
        onComponentUnmount
      ) {
        onComponentUnmount()
      }
    },
    []
  )

  if (!resource || resource instanceof ResourcePending) {
    return <Loading />
  }

  if (resource instanceof Error) {
    return <ErrorFallback error={resource} />
  }

  if (typeof children !== 'function') {
    throw new Error('Child must be a function')
  }

  return children(resource)
}

export default makeLoader
