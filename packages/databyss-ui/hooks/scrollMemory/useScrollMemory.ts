/* eslint-disable no-restricted-globals */

import { debounce } from 'lodash'
import { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const url = new Map<string, number>()

export const useScrollMemory = (
  elementRef: MutableRefObject<HTMLElement | null>
) => {
  const location = useLocation()
  const deferredScrollRef = useRef<number | null>(null)
  const didScrollRef = useRef<boolean | null>(false)

  const onScroll = useCallback(
    debounce(
      () => {
        didScrollRef.current = true
        const _scroll = elementRef.current?.scrollTop
        const _key = location.pathname
        // console.log('[useScrollMemory] saveScroll', _key, _scroll)
        url.set(_key, _scroll!)
      },
      100,
      { leading: true, trailing: true }
    ),
    [elementRef]
  )

  const onPush = useCallback(
    (pathname: string) => {
      // console.log('[useScrollMemory] onPush', location.pathname, pathname)
      if (location.pathname !== pathname) {
        url.delete(pathname)
      }
    },
    [location]
  )

  const patchPushState = () => {
    const _orig = history.pushState
    history.pushState = (state, _, url) => {
      onPush(url as string)
      _orig(state, _, url)
    }
  }

  useEffect(() => {
    patchPushState()
  }, [])

  useEffect(() => {
    if (!elementRef.current) {
      return () => null
    }
    elementRef.current.addEventListener('scroll', onScroll)

    if (deferredScrollRef.current) {
      if (!didScrollRef.current) {
        elementRef.current.scrollTop = deferredScrollRef.current
      }
      deferredScrollRef.current = null
    }

    return () => {
      if (!elementRef.current) {
        return
      }
      elementRef.current.removeEventListener('scroll', onScroll)
    }
  }, [elementRef.current])

  const restoreScroll = () => {
    const _scroll = url.get(location.pathname)
    // console.log('[useScrollMemory] restoreScroll', location.pathname, _scroll)
    if (!_scroll) {
      return
    }
    if (!elementRef.current) {
      deferredScrollRef.current = _scroll
      return
    }
    if (!didScrollRef.current) {
      elementRef.current.scrollTop = _scroll
    }
  }

  return restoreScroll
}
