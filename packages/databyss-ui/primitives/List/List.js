import React from 'react'
import flattenChildren from 'react-keyed-flatten-children'
import { View } from '../'

const List = ({
  children,
  horizontalItemPadding,
  verticalItemPadding,
  removeBorderRadius,
  ...others
}) => (
  <View
    marginTop={verticalItemPadding}
    marginBottom={verticalItemPadding}
    {...others}
  >
    {React.Children.map(
      flattenChildren(children),
      child =>
        child &&
        React.cloneElement(child, {
          ...(removeBorderRadius
            ? {
                borderRadius: 0,
              }
            : {}),
          px: horizontalItemPadding,
          py: verticalItemPadding,
          ...child.props,
        })
    )}
  </View>
)

List.defaultProps = {
  horizontalItemPadding: 'tiny',
  verticalItemPadding: 'tiny',
  removeBorderRadius: true,
}

export default List
