import React from 'react'
import LoadingIcon from '@databyss-org/ui/assets/loading.svg'
import { View, ViewProps } from '@databyss-org/ui/primitives'
import { QueryObserverResult } from 'react-query'
import { ErrorText } from './ErrorText'

interface LoadingFallbackProps extends ViewProps {
  /**
   * Size of the loading icon
   */
  size?: string
  queryObserver?: QueryObserverResult | QueryObserverResult[]
}

export const LoadingFallback = ({
  size,
  queryObserver,
  ...others
}: LoadingFallbackProps) => {
  let _queryObservers: QueryObserverResult[] | null = null
  if (queryObserver) {
    _queryObservers = Array.isArray(queryObserver)
      ? queryObserver
      : [queryObserver]
  }
  return (
    <View
      justifyContent="center"
      alignItems="center"
      alignSelf="stretch"
      justifySelf="stretch"
      height="100%"
      flexShrink={1}
      flexGrow={1}
      {...others}
    >
      {_queryObservers?.some((_obs) => _obs.isError) ? (
        _queryObservers.map((_obs) => <ErrorText error={_obs.error as Error} />)
      ) : (
        <LoadingIcon width={size} height={size} />
      )}
    </View>
  )
}

LoadingFallback.defaultProps = {
  size: 25,
}

export default LoadingFallback
