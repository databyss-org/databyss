import React, { useEffect, useRef, useCallback } from 'react'
import {
  space,
  layout,
  flexbox,
  border,
  position,
  compose,
  variant,
  color,
  shadow,
} from 'styled-system'
import { ThemeProvider } from 'emotion-theming'
import fastCompare from 'react-fast-compare'
import styled from '../styled'
import IS_NATIVE from '../../lib/isNative'

const paddingVariant = variant({
  prop: 'paddingVariant',
  scale: 'paddingVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

const borderVariant = variant({
  prop: 'borderVariant',
  scale: 'borderVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

export const styleProps = compose(
  space,
  layout,
  flexbox,
  border,
  position,
  color,
  shadow,
  paddingVariant,
  borderVariant
)

const View = styled(
  {
    ios: 'View',
    android: 'View',
    default: 'div',
  },
  styleProps
)

export default ({ children, onLayout, ...others }) => {
  const viewRef = useRef(null)
  const clientRect = {}
  const _onLayout = useCallback(
    _clientRect => {
      if (onLayout && !fastCompare(_clientRect, clientRect)) {
        onLayout(clientRect)
      }
      Object.assign(clientRect, _clientRect)
    },
    [clientRect]
  )

  const defaultProps = {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ref: viewRef,
  }
  const webProps = {
    css: {
      boxSizing: 'border-box',
    },
  }
  const nativeProps = {
    onLayout: () =>
      onLayout &&
      viewRef &&
      viewRef.current &&
      viewRef.current.measure((x, y, width, height) =>
        _onLayout({ x, y, width, height })
      ),
  }
  useEffect(() => {
    if (IS_NATIVE) {
      return () => null
    }
    function onWindowResize() {
      if (!onLayout || !viewRef || !viewRef.current) {
        // only do expensive dimension stuff if we care
        return () => null
      }
      const { x, y, width, height } = viewRef.current.getBoundingClientRect()
      _onLayout({ x, y, width, height })
      return () => null
    }
    window.addEventListener('resize', onWindowResize)
    onWindowResize()
    return function cleanup() {
      window.removeEventListener('resize', onWindowResize)
    }
  })

  const view = (
    <View
      paddingVariant="none"
      borderVariant="none"
      {...defaultProps}
      {...(IS_NATIVE ? nativeProps : webProps)}
      {...others}
    >
      {children}
    </View>
  )

  if (others.theme) {
    return <ThemeProvider theme={others.theme}>{view}</ThemeProvider>
  }

  return view
}
