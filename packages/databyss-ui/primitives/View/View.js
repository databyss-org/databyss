import React, { useEffect, useRef, useCallback, forwardRef } from 'react'
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

export const paddingVariant = variant({
  prop: 'paddingVariant',
  scale: 'paddingVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

export const borderVariant = variant({
  prop: 'borderVariant',
  scale: 'borderVariants',
  variants: {
    // need one member to enable theming
    default: {},
  },
})

export const shadowVariant = variant({
  prop: 'shadowVariant',
  scale: 'shadowVariants',
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
  borderVariant,
  shadowVariant
)

const Styled = styled(
  {
    ios: 'View',
    android: 'View',
    default: 'div',
  },
  styleProps
)

const View = forwardRef(({ children, onLayout, ...others }, ref) => {
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
    paddingVariant: 'none',
    borderVariant: 'none',
    shadowVariant: 'none',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
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

  const setRef = _ref => {
    viewRef.current = _ref
    if (ref) {
      ref.current = _ref
    }
  }

  const view = (
    <Styled
      ref={setRef}
      {...defaultProps}
      {...(IS_NATIVE ? nativeProps : webProps)}
      {...others}
    >
      {children}
    </Styled>
  )

  if (others.theme) {
    return <ThemeProvider theme={others.theme}>{view}</ThemeProvider>
  }

  return view
})

export default View
