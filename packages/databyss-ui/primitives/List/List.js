import React from 'react'
import { View } from '../'

const List = ({
  children,
  horizontalItemPadding,
  verticalItemPadding,
  ...others
}) => (
  <View
    marginTop={verticalItemPadding}
    marginBottom={verticalItemPadding}
    {...others}
  >
    {React.Children.map(children, child =>
      React.cloneElement(child, {
        borderRadius: 0,
        paddingLeft: horizontalItemPadding,
        paddingRight: horizontalItemPadding,
        paddingTop: verticalItemPadding,
        paddingBottom: verticalItemPadding,
        ...child.props,
      })
    )}
  </View>
)

List.defaultProps = {
  horizontalItemPadding: 'tiny',
  verticalItemPadding: 'tiny',
}

export default List
