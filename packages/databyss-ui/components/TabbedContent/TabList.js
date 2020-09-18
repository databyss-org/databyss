import React, { useCallback, useState } from 'react'

import { View, styled } from '../../primitives'

import Tab from './Tab'

/*
export interface TabListItemProps {
  _id: identifier
  title: string (TODO: rename to label?)
  icon?: <SVG/>
}

export interface TabListProps {
  items: TabListItemProps[]
  onChange: (itemId, itemIndex) => void
}
*/

// styled components
const tabListStyles = () => ({
  flexDirection: 'row',
})

const StyledTabList = styled(View, tabListStyles)

// component
const TabList = props => {
  const { selectedIndex, items, onChange } = props
  const hasInitSelectedIndex = selectedIndex !== undefined

  // TODO: error checks

  const [internalSelectedIndex, setSelectedIndex] = useState(
    hasInitSelectedIndex ? selectedIndex : 0
  )

  const getTabWidth = items => {
    let response = '100%'

    if (items && items.length) {
      response = `${Math.round(100 / items.length)}%`
    }

    return response
  }

  const isActiveTab = index => index === internalSelectedIndex

  const onTabClick = useCallback(
    itemId => {
      const itemIndex = items.findIndex(item => item._id === itemId)
      setSelectedIndex(itemIndex)
      if (onChange) {
        onChange({ itemId, itemIndex })
      }
    },
    [setSelectedIndex]
  )

  // render methods
  const renderTabs = () =>
    items.map((item, index) => (
      <Tab
        key={item._id}
        id={item._id}
        icon={item.icon}
        isActive={isActiveTab(index)}
        label={item.label}
        onClick={() => onTabClick(item._id)}
        width={getTabWidth(items)}
      />
    ))

  const render = () => (
    <StyledTabList role="tablist" className="tab-list">
      {renderTabs()}
    </StyledTabList>
  )

  return render()
}

export default TabList
