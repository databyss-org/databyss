import React from 'react'

import { styled, View } from '@databyss-org/ui/primitives'

import IconControl from './IconControl'

// styled components
const areaStyles = () => ({
  width: '100%',
})

const StyledArea = styled(View, areaStyles)

/*
interface ListProps {
  items: ListItemProps[]
}
*/

// component
const TappableList = props => {
  const { items } = props
  // render methods
  const renderListItems = () =>
    items.map(item => (
      <IconControl
        key={item._id}
        href={item.href}
        isActive={false}
        label={item.label}
        icon={item.icon}
      />
    ))

  const render = () => <StyledArea>{renderListItems()}</StyledArea>

  return render()
}

export default TappableList
