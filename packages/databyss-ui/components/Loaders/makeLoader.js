import React, { useEffect } from 'react'
import { ResourcePending } from '@databyss-org/services/lib/ResourcePending'
import ErrorFallback from '../Notify/ErrorFallback'
import Loading from '../Notify/LoadingFallback'

const makeLoader = ({ resource, children, onUnload }) => {
  useEffect(
    () => () => {
      if (onUnload) {
        onUnload()
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
