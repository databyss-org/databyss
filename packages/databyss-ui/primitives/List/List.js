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
  handlesRef,
  ...others
}) => {
  const _render = (
    <View py={verticalItemPadding} {...others}>
      {React.Children.map(flattenChildren(children), (child) => {
        if (!child) {
          return false
        }
        // apply mx, my, px, py to correctly override
        const childProps = Object.assign({}, child.props)
        if (typeof childProps.mx !== 'undefined') {
          childProps.ml = childProps.mx
          childProps.mr = childProps.mx
        }
        if (typeof childProps.my !== 'undefined') {
          childProps.mt = childProps.my
          childProps.mb = childProps.my
        }
        if (typeof childProps.px !== 'undefined') {
          childProps.pl = childProps.px
          childProps.pr = childProps.px
        }
        if (typeof childProps.py !== 'undefined') {
          childProps.pt = childProps.py
          childProps.pb = childProps.py
        }
        return React.cloneElement(child, {
          ...(removeBorderRadius
            ? {
                borderRadius: 0,
              }
            : {}),
          ...(typeof childProps.padding === 'undefined' &&
          typeof childProps.p === 'undefined'
            ? {
                pl: horizontalItemPadding,
                pr: horizontalItemPadding,
                pt: verticalItemPadding,
                pb: verticalItemPadding,
              }
            : {}),
          ...(typeof childProps.margin === 'undefined' &&
          typeof childProps.m === 'undefined'
            ? {
                ml: horizontalItemMargin,
                mr: horizontalItemMargin,
                mt: verticalItemMargin,
                mb: verticalItemMargin,
              }
            : {}),
          ...childProps,
        })
      })}
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
        handlesRef={handlesRef}
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
