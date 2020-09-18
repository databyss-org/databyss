import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import { useKeyboardNavigationContext } from './KeyboardNavigationProvider'

const KeyboardNavigationItem = ({ children }) => {
  const [index, setIndex] = useState(false)
  const {
    getNextItemIndex,
    activeIndex,
    orderKey,
    setActiveItem,
  } = useKeyboardNavigationContext()
  const navigationItemRef = useRef()
  const navigationItemHandle = useRef()

  if (activeIndex === index && navigationItemRef.current) {
    scrollIntoView(navigationItemRef.current, {
      block: 'nearest',
      inline: 'nearest',
      scrollMode: 'if-needed',
    })
    setActiveItem({ navigationItemRef, navigationItemHandle })
  }

  useEffect(
    () => {
      const _idx = getNextItemIndex()
      setIndex(_idx)
    },
    [orderKey]
  )

  return useMemo(
    () =>
      React.cloneElement(React.Children.only(children), {
        activeNavigationItem: activeIndex === index,
        navigationItemRef,
        navigationItemHandle,
      }),
    [activeIndex === index, orderKey, children]
  )
}

export default KeyboardNavigationItem

export const withKeyboardNavigation = Wrapped => props => (
  <KeyboardNavigationItem>
    <Wrapped {...props} />
  </KeyboardNavigationItem>
)
