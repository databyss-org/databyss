import React from 'react'
import flattenChildren from 'react-keyed-flatten-children'
import { KeyboardNavigationProvider } from './KeyboardNavigationProvider'
import { View } from '../'

const List = ({
  children,
  horizontalItemPadding,
  verticalItemPadding,
  horizontalItemMargin,
  verticalItemMargin,
  removeBorderRadius,
  keyboardNavigation,
  keyboardEventsActive,
  orderKey,
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
            pl: horizontalItemPadding,
            pr: horizontalItemPadding,
            pt: verticalItemPadding,
            pb: verticalItemPadding,
            ml: horizontalItemMargin,
            mr: horizontalItemMargin,
            mt: verticalItemMargin,
            mb: verticalItemMargin,
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
  horizontalItemMargin: 0,
  verticalItemMargin: 0,
  removeBorderRadius: true,
  keyboardNavigation: false,
  keyboardEventsActive: false,
}

export default List
