import React, { useMemo, useState, useRef, useEffect } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import { useKeyboardNavigationContext } from './KeyboardNavigationProvider'

const KeyboardNavigationItem = ({ children }) => {
  const [index, setIndex] = useState(false)
  const {
    getNextItemIndex,
    activeIndex,
    orderKey,
    setActiveItem,
    keyboardEventsActive,
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

  // if we're the first item and activeIndex has been reset to -1, scroll to our ref to restore
  // scroll to the top of the list
  if (activeIndex < 0 && index === 0 && keyboardEventsActive) {
    scrollIntoView(navigationItemRef.current, {
      block: 'nearest',
      inline: 'nearest',
      scrollMode: 'if-needed',
    })
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
        activeNavigationItem: keyboardEventsActive && activeIndex === index,
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
