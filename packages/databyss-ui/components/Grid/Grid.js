import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Grid = ({
  children,
  columnGap,
  rowGap,
  flexWrap,
  alignItems,
  ...others
}) => {
  const childrenWithLayout = React.Children.map(children, child =>
    React.cloneElement(child, {
      flexGrow: 0,
      flexShrink: 0,
      marginRight: columnGap,
      marginBottom: rowGap,
      ...child.props,
    })
  )

  return (
    <View {...others}>
      <View
        mr={`${columnGap}Negative`}
        mb={`${rowGap}Negative`}
        flexDirection="row"
        flexWrap={flexWrap || 'wrap'}
        alignItems={alignItems}
      >
        {childrenWithLayout}
      </View>
    </View>
  )
}

Grid.defaultProps = {
  columnGap: 'medium',
  rowGap: 'medium',
}

export default Grid
