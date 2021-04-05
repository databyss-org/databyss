import React, { useEffect, useRef } from 'react'
import LoadingIcon from '@databyss-org/ui/assets/loading.svg'
import { View, ViewProps } from '@databyss-org/ui/primitives'
import { QueryObserverResult } from 'react-query'
import { useNotifyContext, DialogOptions } from './NotifyProvider'
import { ErrorText } from './ErrorText'

interface LoadingFallbackProps extends ViewProps {
  /**
   * Size of the loading icon.
   */
  size?: string
  /**
   * The react-query queryObserver this loader is waiting on
   */
  queryObserver?: QueryObserverResult | QueryObserverResult[]
  /**
   * If true, show a @longWaitMessage after @longWaitMs
   */
  showLongWaitMessage?: boolean
  /**
   * Milliseconds before the longWaitMessage is shown
   */
  longWaitMs?: number
  /**
   * Text to show if more than @longWaitMs ms has elapsed
   */
  longWaitDialogOptions?: DialogOptions
}

export const LoadingFallback = ({
  size,
  queryObserver,
  longWaitMs,
  showLongWaitMessage,
  longWaitDialogOptions,
  ...others
}: LoadingFallbackProps) => {
  const { notify, hideDialog } = useNotifyContext()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!showLongWaitMessage) {
      return () => null
    }
    timerRef.current = setTimeout(() => {
      notify({
        showConfirmButtons: false,
        ...longWaitDialogOptions,
      })
    }, longWaitMs)
    return () => {
      if (timerRef.current) {
        hideDialog()
        clearTimeout(timerRef.current!)
      }
    }
  }, [])

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
  showLongWaitMessage: false,
  longWaitMs: 1000,
  longWaitDialogOptions: {
    message:
      "<strong>Databyss is synching with the cloud.</strong><p>If it's not done in about a minute...</p><p>&nbsp;&nbsp;&nbsp;...just wait longer 🐬.</p>",
    html: true,
  },
}

export default LoadingFallback
