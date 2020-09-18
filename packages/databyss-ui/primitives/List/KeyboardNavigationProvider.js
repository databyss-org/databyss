import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'

export const KeyboardNavigationContext = createContext()

export const KeyboardNavigationProvider = ({
  children,
  onActiveIndexChanged,
  orderKey,
  keyboardEventsActive,
}) => {
  const itemCountRef = useRef(0)
  const activeIndexRef = useRef(0)
  const orderKeyRef = useRef('')
  const activeItemRef = useRef()
  const [activeIndex, setActiveIndex] = useState(0)

  if (orderKeyRef.current !== orderKey) {
    itemCountRef.current = 0
    activeIndexRef.current = 0
  }

  /**
   * Gets the next item index and increments the state.itemCount
   */
  const getNextItemIndex = useCallback(
    () => {
      const _idx = itemCountRef.current
      itemCountRef.current += 1
      return _idx
    },
    [itemCountRef]
  )

  /**
   * Increments activeIndex by 1, wrapping to 0 at end of list
   * Returns next activeIndex
   */
  const incrementActiveIndex = step => {
    activeIndexRef.current += step
    if (activeIndexRef.current > itemCountRef.current - 1) {
      activeIndexRef.current = 0
    }
    if (activeIndexRef.current < 0) {
      activeIndexRef.current = itemCountRef.current - 1
    }
    setActiveIndex(activeIndexRef.current)
    return activeIndexRef.current
  }

  const onKeydown = useCallback(
    e => {
      if (e.key === 'Down' || e.key === 'ArrowDown') {
        e.preventDefault()
        incrementActiveIndex(1)
      }
      if (e.key === 'Up' || e.key === 'ArrowUp') {
        e.preventDefault()
        incrementActiveIndex(-1)
      }
      if (
        e.key === 'Enter' &&
        activeItemRef.current?.navigationItemHandle?.current
          ?.selectNavigationItem
      ) {
        e.preventDefault()
        activeItemRef.current.navigationItemHandle.current.selectNavigationItem()
      }
    },
    [itemCountRef]
  )

  const setActiveItem = item => {
    activeItemRef.current = item
  }

  useEffect(
    () => {
      if (keyboardEventsActive) {
        window.addEventListener('keydown', onKeydown)
      } else {
        window.removeEventListener('keydown', onKeydown)
      }
      return () => {
        window.removeEventListener('keydown', onKeydown)
      }
    },
    [keyboardEventsActive]
  )

  useEffect(
    () => {
      onActiveIndexChanged()
    },
    [activeIndex]
  )

  useEffect(
    () => {
      orderKeyRef.current = orderKey
    },
    [orderKey]
  )

  return (
    <KeyboardNavigationContext.Provider
      value={{
        getNextItemIndex,
        activeIndex: keyboardEventsActive ? activeIndexRef.current : 0,
        orderKey,
        keyboardEventsActive,
        setActiveItem,
      }}
    >
      {children}
    </KeyboardNavigationContext.Provider>
  )
}

KeyboardNavigationProvider.defaultProps = {
  onActiveIndexChanged: () => null,
}

export const useKeyboardNavigationContext = () => {
  const _ctx = useContext(KeyboardNavigationContext)
  if (_ctx) {
    return _ctx
  }
  return {
    getNextItemIndex: () => 0,
    activeIndex: -1,
    orderKey: null,
  }
}
