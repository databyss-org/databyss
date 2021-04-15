import React from 'react'

import { View } from '../../primitives'

/*
export interface TabPanelProps {
  // the DOM id of the panel, so it can be targetted by aria-controls
  id: string
  
  // the DOM id of the tab button that labels this tab panel
  labelledBy: string

  // whether or not the tab should be presented visually
  isActive: boolean

  children
}
*/

// component
const TabPanel = (props) => {
  const { id, labelledBy, isActive, children } = props

  // render methods
  const render = () =>
    isActive ? (
      <View
        id={id}
        role="tabpanel"
        tabindex="0"
        ariaLabelledby={labelledBy}
        flexShrink={1}
        overflow="hidden"
      >
        {children}
      </View>
    ) : null

  return render()
}

export default TabPanel
