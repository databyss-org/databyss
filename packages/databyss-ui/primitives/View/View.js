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
import forkRef from '@databyss-org/ui/lib/forkRef'
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

export const borderRadiusVariant = variant({
  prop: 'borderRadius',
  scale: 'borderRadiusVariants',
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

export const hlineVariant = variant({
  prop: 'hlineVariant',
  scale: 'hlineVariants',
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

export const widthVariant = variant({
  prop: 'widthVariant',
  scale: 'widthVariants',
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
  hlineVariant,
  shadowVariant,
  widthVariant,
  borderRadiusVariant
)

export const defaultProps = {
  paddingVariant: 'none',
  borderVariant: 'none',
  shadowVariant: 'none',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
  overflow: 'visible',
  display: 'flex',
  flexDirection: 'column',
}

export const webProps = {
  css: {
    boxSizing: 'border-box',
  },
}

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
    <Styled
      ref={forkRef(viewRef, ref)}
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
