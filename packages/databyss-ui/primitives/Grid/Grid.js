import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Grid = ({
  children,
  columnGap,
  rowGap,
  flexWrap,
  alignItems,
  singleRow,
  overflow,
  ...others
}) => {
  const childrenWithLayout = React.Children.map(children, child =>
    React.cloneElement(child, {
      flexGrow: 0,
      flexShrink: 0,
      marginRight: columnGap,
      marginBottom: singleRow ? 0 : rowGap,
      ...child.props,
    })
  )

  const columnGapCorrection = columnGap === 'none' ? 0 : `${columnGap}Negative`
  const rowGapCorrection = rowGap === 'none' ? 0 : `${rowGap}Negative`

  return (
    <View overflow={overflow} {...others}>
      <View
        mr={columnGapCorrection}
        mb={singleRow ? 0 : rowGapCorrection}
        flexDirection="row"
        flexWrap={flexWrap || 'wrap'}
        alignItems={alignItems}
        overflow={overflow}
      >
        {childrenWithLayout}
      </View>
    </View>
  )
}

Grid.defaultProps = {
  columnGap: 'medium',
  rowGap: 'medium',
  overflow: 'hidden',
}

export default Grid
