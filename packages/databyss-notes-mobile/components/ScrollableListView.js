import React, { useEffect, useRef } from 'react'

import { ScrollView } from '@databyss-org/ui/primitives'
import { useScrollMemory } from '@databyss-org/ui/hooks/scrollMemory/useScrollMemory'

import { getScrollViewMaxHeight } from '../utils/getScrollViewMaxHeight'

import TappableList from './TappableList'

// component
const ScrollableListView = (props) => {
  const scrollViewRef = useRef(null)
  const restoreScroll = useScrollMemory(scrollViewRef)

  const getMaxHeight = () => {
    if (props.maxHeight) {
      return props.maxHeight
    }
    return getScrollViewMaxHeight()
  }

  useEffect(() => {
    restoreScroll()
  }, [])

  // render methods
  const render = () => (
    <ScrollView maxHeight={getMaxHeight()} ref={scrollViewRef}>
      <TappableList items={props.listItems} />
    </ScrollView>
  )

  return render()
}

export default ScrollableListView
