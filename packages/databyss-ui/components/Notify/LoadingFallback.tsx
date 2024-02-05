import React, { useEffect, useRef } from 'react'
import LoadingIcon from '@databyss-org/ui/assets/loading.svg'
import { View, ViewProps } from '@databyss-org/ui/primitives'
import { QueryObserverResult } from '@tanstack/react-query'
import { useNotifyContext, DialogOptions } from './NotifyProvider'
import { ErrorText } from './ErrorText'

interface LoadingFallbackProps extends ViewProps {
  /**
   * Size of the loading icon.
   */
  size?: number
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
  /**
   * During long wait, should we hide the application and show the splash screen?
   */
  splashOnLongWait?: boolean
}

export const LoadingFallback = ({
  size,
  queryObserver,
  longWaitMs,
  showLongWaitMessage,
  longWaitDialogOptions,
  splashOnLongWait,
  ...others
}: LoadingFallbackProps) => {
  const { notify, hideDialog, hideApplication, showApplication } =
    useNotifyContext() ?? {}
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.FORCE_MOBILE ||
      process.env.STORYBOOK ||
      !showLongWaitMessage
    ) {
      return () => null
    }
    timerRef.current = setTimeout(() => {
      if (splashOnLongWait) {
        hideApplication()
      }
      notify({
        showConfirmButtons: false,
        ...longWaitDialogOptions,
      })
    }, longWaitMs)
    return () => {
      if (timerRef.current) {
        if (splashOnLongWait) {
          showApplication()
        }
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
  longWaitMs: 10000,
  longWaitDialogOptions: {
    message:
      "<strong>Databyss is synching with the cloud.</strong><p>If it's not done shortly...</p><p>&nbsp;&nbsp;&nbsp;...just wait longer.</p>",
    html: true,
    dolphins: true,
  },
}

export default LoadingFallback
