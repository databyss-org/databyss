import React, { useEffect } from 'react'
import { ResourcePending } from '@databyss-org/services/interfaces/ResourcePending'
import ErrorFallback from '../Notify/ErrorFallback'
import Loading from '../Notify/LoadingFallback'

const MakeLoader = ({ resource, children, onUnload, onLoad }) => {
  useEffect(
    () => () => {
      if (onUnload) {
        onUnload()
      }
    },
    []
  )

  useEffect(
    () => {
      if (
        onLoad &&
        resource &&
        !(resource instanceof ResourcePending) &&
        !(resource instanceof Error)
      ) {
        onLoad(resource)
      }
    },
    [resource]
  )

  if (!resource || resource instanceof ResourcePending) {
    return <Loading padding="small" />
  }

  if (resource instanceof Error) {
    return <ErrorFallback error={resource} />
  }

  if (typeof children !== 'function') {
    return children
  }

  return children(resource)
}

export default MakeLoader
