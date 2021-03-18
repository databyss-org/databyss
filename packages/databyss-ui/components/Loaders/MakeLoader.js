import React, { useEffect } from 'react'
import { ResourcePending } from '@databyss-org/services/interfaces/ResourcePending'
import ErrorFallback from '../Notify/ErrorFallback'
import Loading from '../Notify/LoadingFallback'

const MakeLoader = ({
  resources,
  children,
  onUnload,
  onLoad,
  fallbackSize,
}) => {
  useEffect(
    () => () => {
      if (onUnload) {
        onUnload()
      }
    },
    []
  )
  const isLoading = Array.isArray(resources)
    ? resources.some((r) => !r || r instanceof ResourcePending)
    : !resources || resources instanceof ResourcePending

  const errors = Array.isArray(resources)
    ? resources.some((r) => r && r instanceof Error)
    : resources instanceof Error

  useEffect(() => {
    if (onLoad && resources && !isLoading && !errors) {
      onLoad(resources)
    }
  }, [resources])

  if (isLoading) {
    return <Loading padding="small" size={fallbackSize || '25'} />
  }

  if (errors) {
    return (
      <ErrorFallback
        error={
          Array.isArray(resources)
            ? resources.filter((r) => r && r instanceof Error)
            : resources
        }
      />
    )
  }

  if (typeof children !== 'function') {
    return children
  }

  return children(resources)
}

export default MakeLoader
