import React, { useEffect } from 'react'
import { ResourcePending } from '@databyss-org/services/interfaces/ResourcePending'
import ErrorFallback from '../Notify/ErrorFallback'
import Loading from '../Notify/LoadingFallback'

const MakeLoader = ({ resources, children, onUnload, onLoad }) => {
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
        resources &&
        !(resources instanceof ResourcePending) &&
        !(resources instanceof Error)
      ) {
        onLoad(resources)
      }
    },
    [resources]
  )

  const isLoading = Array.isArray(resources)
    ? resources.some(resource => {
        const resourceProperty = Object.values(resource)[0]
        return !resourceProperty || resourceProperty instanceof ResourcePending
      })
    : !resources || resources instanceof ResourcePending

  const errors = Array.isArray(resources)
    ? resources.some(resource => Object.values(resource)[0] instanceof Error)
    : resources instanceof Error

  if (isLoading) {
    return <Loading padding="small" />
  }

  if (errors) {
    return (
      <ErrorFallback
        error={
          Array.isArray(resources)
            ? resources.filter(
                resource =>
                  resource && Object.values(resource)[0] instanceof Error
              )
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
