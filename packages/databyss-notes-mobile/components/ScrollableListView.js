import React from 'react'

import { ScrollView } from '@databyss-org/ui/primitives'

import { getScrollViewMaxHeight } from '../utils/getScrollViewMaxHeight'

import TappableList from './TappableList'

// component
const ScrollableListView = props => {
  const getMaxHeight = () => {
    if (props.maxHeight) {
      return props.maxHeight
    }
    return getScrollViewMaxHeight()
  }

  // render methods
  const render = () => (
    <ScrollView maxHeight={getMaxHeight()}>
      <TappableList items={props.listItems} />
    </ScrollView>
  )

  return render()
}

export default ScrollableListView
