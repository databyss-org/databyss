import React from 'react'
import flattenChildren from 'react-keyed-flatten-children'
import { KeyboardNavigationProvider } from './KeyboardNavigationProvider'
import { View } from '../'

const List = ({
  children,
  horizontalItemPadding,
  verticalItemPadding,
  removeBorderRadius,
  keyboardNavigation,
  keyboardEventsActive,
  orderKey,
  onActiveItemChanged,
  onActiveIndexChanged,
  initialActiveIndex,
  onItemSelected,
  ...others
}) => {
  const _render = (
    <View py={verticalItemPadding} {...others}>
      {React.Children.map(
        flattenChildren(children),
        (child) =>
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

  if (keyboardNavigation) {
    return (
      <KeyboardNavigationProvider
        keyboardEventsActive={keyboardEventsActive}
        orderKey={orderKey}
        onActiveItemChanged={onActiveItemChanged}
        onActiveIndexChanged={onActiveIndexChanged}
        initialActiveIndex={initialActiveIndex}
        onItemSelected={onItemSelected}
      >
        {_render}
      </KeyboardNavigationProvider>
    )
  }

  return _render
}

List.defaultProps = {
  horizontalItemPadding: 'tiny',
  verticalItemPadding: 'tiny',
  removeBorderRadius: true,
  keyboardNavigation: false,
  keyboardEventsActive: false,
}

export default List
