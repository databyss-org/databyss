import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
} from 'react'

export const KeyboardNavigationContext = createContext()

export const KeyboardNavigationProvider = ({
  children,
  onActiveIndexChanged,
  orderKey,
  keyboardEventsActive,
  initialActiveIndex,
  onItemSelected,
  handlesRef,
}) => {
  const itemCountRef = useRef(0)
  const activeIndexRef = useRef(initialActiveIndex)
  const [orderKeyValue, setOrderKeyValue] = useState('')
  const activeItemRef = useRef()
  const nextInitialActiveIndex = useRef(initialActiveIndex)
  const [, setActiveIndex] = useState(activeIndexRef.current)

  useImperativeHandle(handlesRef, () => ({
    getActiveIndex: () => activeIndexRef.current,
    setActiveIndex: (index) => {
      activeIndexRef.current = index
      nextInitialActiveIndex.current = index
      setActiveIndex(index)
    },
  }))

  /**
   * Gets the next item index and increments the state.itemCount
   */
  const getNextItemIndex = useCallback(() => {
    const _idx = itemCountRef.current
    itemCountRef.current += 1
    return _idx
  }, [itemCountRef])

  /**
   * Increments activeIndex by 1, wrapping to 0 at end of list
   * Calls setActiveIndex to re-render the children
   */
  const incrementActiveIndex = (step) => {
    activeIndexRef.current += step
    if (activeIndexRef.current > itemCountRef.current - 1) {
      activeIndexRef.current = 0
    }
    if (activeIndexRef.current < 0) {
      activeIndexRef.current = itemCountRef.current - 1
    }
    setActiveIndex(activeIndexRef.current)
  }

  const onKeydown = useCallback(
    (e) => {
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
        onItemSelected(activeItemRef.current)
      }
    },
    [itemCountRef]
  )

  const setActiveItem = (item) => {
    activeItemRef.current = item
  }

  useEffect(() => {
    if (keyboardEventsActive) {
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [keyboardEventsActive])

  useEffect(() => {
    onActiveIndexChanged(activeIndexRef.current)
  }, [activeIndexRef.current])

  useEffect(() => {
    itemCountRef.current = 0
    activeIndexRef.current = nextInitialActiveIndex.current
    setOrderKeyValue(orderKey)
  }, [orderKey])

  return (
    <KeyboardNavigationContext.Provider
      value={{
        getNextItemIndex,
        activeIndex: activeIndexRef.current,
        orderKey: orderKeyValue,
        activeIndexRef,
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
  initialActiveIndex: -1, // nothing is selected by default
  onItemSelected: () => null,
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
