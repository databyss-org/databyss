import React, { useCallback, useState } from 'react'

import { View } from '../../primitives'

import TabList from './TabList'
import TabPanel from './TabPanel'

/*
export interface TabbedContentProps {
  selectedIndex: number
  tabItems: TabListItemProps[]
  panels: TabPanelProps[]
  onChange?: (itemId, itemIndex) => void
}
*/

// component
const TabbedContent = (props) => {
  const { selectedIndex, tabItems, panels, onChange } = props
  const hasInitSelectedIndex = selectedIndex !== undefined

  // error checks
  if (!tabItems || !Array.isArray(tabItems)) {
    throw new Error(
      '<TabbedContent/> expected the `tabItems` property, ' +
        'which is expected to be an array.'
    )
  }
  if (!panels || !Array.isArray(panels)) {
    throw new Error(
      '<TabbedContent/> expected the `panels` property, ' +
        'which is expected to be an array.'
    )
  }
  if (tabItems.length !== panels.length) {
    throw new Error(
      '<TabbedContent/> expected `tabItems` and `panels` array lengths to match, ' +
        'i.e. the amount of tabs must match the amount of panels.'
    )
  }
  if (hasInitSelectedIndex) {
    const typeOfInitSelectedIndex = typeof selectedIndex
    if (typeOfInitSelectedIndex !== 'number') {
      throw new Error(
        '<TabbedContent/> received the wrong type for `selectedIndex`. ' +
          `Expected a number, got "${typeOfInitSelectedIndex}".`
      )
    }
    if (selectedIndex < 0) {
      throw new Error(
        '<TabbedContent/> received a negative value for `selectedIndex`. ' +
          'Expected an index value, which should be positive. ' +
          'You can omit this property if you do not want to manage the initially set index. '
      )
    }
    if (selectedIndex >= tabItems.length) {
      throw new Error(
        '<TabbedContent/> received a value for `selectedIndex` ' +
          `(${selectedIndex}) ` +
          `which is higher or equal to the amount of tabs (${tabItems.length}).`
      )
    }
  }

  const [selectedTab, setSelectedTab] = useState(
    hasInitSelectedIndex ? selectedIndex : 0
  )

  const getTabIdAt = (index) => `${tabItems[index]._id}Tab`

  const getPanelIdAt = (index) => `${tabItems[index]._id}Panel`

  const setSelectedTabWithIndex = (index) => {
    // quick exit
    if (index === null || index === undefined) {
      return
    }

    // error checks
    const typeOfIndex = typeof index
    if (typeOfIndex !== 'number') {
      throw new Error(
        'setSelectedTabWithIndex() received the wrong type: ' +
          `expected a number, got "${typeOfIndex}".`
      )
    }
    if (index < 0) {
      throw new Error(
        'setSelectedTabWithIndex() received a negative value. ' +
          'Expected an index value, which should be positive. '
      )
    }
    if (index >= tabItems.length) {
      throw new Error(
        `setSelectedTabWithIndex() received a value (${index}) '
        + 'which higher or equal to the amount of tabs (${tabItems.length}).`
      )
    }

    // all is finally good, apply
    setSelectedTab(index)

    if (onChange) {
      onChange(tabItems[index]._id, index)
    }
  }

  const onTabChange = useCallback(
    (payload) => {
      setSelectedTabWithIndex(payload.itemIndex)
    },
    [setSelectedTabWithIndex]
  )

  // render methods
  const renderPanels = () =>
    panels.map((panel, index) => (
      <TabPanel
        key={getPanelIdAt(index)}
        id={getPanelIdAt(index)}
        labelledBy={getTabIdAt(index)}
        isActive={index === selectedTab}
      >
        {panel}
      </TabPanel>
    ))

  const render = () => (
    <View>
      <TabList
        items={tabItems}
        selectedIndex={selectedIndex}
        onChange={onTabChange}
      />
      {renderPanels()}
    </View>
  )

  return render()
}

export default TabbedContent
