import React, { useEffect } from 'react'
import { ResourcePending } from '@databyss-org/services/interfaces/ResourcePending'
import ErrorFallback from '../Notify/ErrorFallback'
import Loading from '../Notify/LoadingFallback'

const MakeLoader = ({ resource, children, onUnload }) => {
  useEffect(
    () => () => {
      if (onUnload) {
        onUnload()
      }
    },
    []
  )

  if (!resource || resource instanceof ResourcePending) {
    return <Loading padding="small" />
  }

  if (resource instanceof Error) {
    return <ErrorFallback error={resource} />
  }

  if (typeof children !== 'function') {
    throw new Error('Child must be a function')
  }

  return children(resource)
}

export default MakeLoader
