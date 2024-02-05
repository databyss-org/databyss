import React, { useEffect } from 'react'
import { ResourcePending } from '@databyss-org/services/interfaces/ResourcePending'
import ErrorFallback from '../Notify/ErrorFallback'
import Loading from '../Notify/LoadingFallback'

const MakeLoader = ({
  resources,
  children,
  onUnload,
  onLoad,
  onError,
  errorFallback,
  loadingFallbackOptions,
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
    return <Loading {...loadingFallbackOptions} />
  }

  if (errors) {
    // console.log('[MakeLoader] errors', errors)
    if (onError) {
      onError(errors)
    }
    return (
      errorFallback ?? (
        <ErrorFallback
          error={
            Array.isArray(resources)
              ? resources.filter((r) => r && r instanceof Error)
              : resources
          }
        />
      )
    )
  }

  if (typeof children !== 'function') {
    return children
  }

  return children(resources)
}

MakeLoader.defaultProps = {
  loadingFallbackOptions: {
    padding: 'small',
    size: '25',
  },
}

export default MakeLoader
