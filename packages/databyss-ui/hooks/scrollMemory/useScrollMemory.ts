/* eslint-disable no-restricted-globals */

import { debounce } from 'lodash'
import { MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const url = new Map<string, number>()

// monkeypatching caused issues with ReactRouter,
// so this method must be called just before the RR `navigate` call
// to ensure that navigating to a page resets the scroll for that page
export const resetScrollMemoryBeforeNavigate = (pathname: string) => {
  if (location.pathname !== pathname) {
    url.delete(pathname)
  }
}

export const useScrollMemory = (
  elementRef: MutableRefObject<HTMLElement | null>
) => {
  const location = useLocation()
  const deferredScrollRef = useRef<number | null>(null)
  const didScrollRef = useRef<boolean>(false)

  useEffect(() => {
    didScrollRef.current = false
  }, [location.pathname])

  const onScroll = useCallback(
    debounce(
      () => {
        didScrollRef.current = true
        const _scroll = elementRef.current?.scrollTop
        const _key = location.pathname
        url.set(_key, _scroll!)
        // console.log('[useScrollMemory]', _key, _scroll)
      },
      100,
      { leading: true, trailing: true }
    ),
    [elementRef]
  )

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
    if (!_scroll) {
      return
    }
    if (!elementRef.current) {
      deferredScrollRef.current = _scroll
      return
    }
    // console.log('[useScrollMemory] restore', _scroll, didScrollRef.current)
    if (!didScrollRef.current) {
      elementRef.current.scrollTop = _scroll
    }
  }

  return restoreScroll
}
