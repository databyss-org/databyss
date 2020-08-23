import React, { useEffect } from 'react'
import { ResourcePending } from '@databyss-org/services/interfaces/ResourcePending'
import ErrorFallback from '../Notify/ErrorFallback'
import Loading from '../Notify/LoadingFallback'

const MakeLoader = ({
  resource,
  children,
  onUnload,
  onLoad,
  LoadingFallback,
}) => {
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
    return LoadingFallback && LoadingFallback
  }

  if (resource instanceof Error) {
    return <ErrorFallback error={resource} />
  }

  if (typeof children !== 'function') {
    return children
  }

  return children(resource)
}

MakeLoader.defaultProps = {
  LoadingFallback: <Loading padding="small" />,
}

export default MakeLoader
