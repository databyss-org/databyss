import React from 'react'
import { View } from '@databyss-org/ui/primitives'

const Grid = ({
  children,
  columnGap,
  rowGap,
  flexWrap,
  alignItems,
  singleRow,
  singleColumn,
  overflow,
  justifyContent,
  ...others
}) => {
  const childrenWithLayout = React.Children.map(
    children,
    child =>
      child &&
      React.cloneElement(child, {
        flexGrow: 0,
        flexShrink: 0,
        marginRight: singleColumn ? 0 : columnGap,
        marginBottom: singleRow ? 0 : rowGap,
        ...child.props,
      })
  )

  const columnGapCorrection = columnGap === 'none' ? 0 : `${columnGap}Negative`
  const rowGapCorrection = rowGap === 'none' ? 0 : `${rowGap}Negative`

  return (
    <View overflow={overflow} {...others}>
      <View
        justifyContent={justifyContent}
        mr={singleColumn ? 0 : columnGapCorrection}
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
  overflow: 'visible',
}

export default Grid
