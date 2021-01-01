import React, { useRef, useCallback, forwardRef } from 'react'
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
import { useDrop } from '@databyss-org/ui/primitives/Gestures/GestureProvider'
import { zIndex } from '@databyss-org/ui/theming/system'
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

export const wrapVariant = variant({
  prop: 'wrapVariant',
  scale: 'wrapVariants',
  variants: {
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
  zIndex,
  paddingVariant,
  borderVariant,
  hlineVariant,
  shadowVariant,
  widthVariant,
  borderRadiusVariant,
  wrapVariant
)

export const defaultProps = {
  paddingVariant: 'none',
  borderVariant: 'none',
  shadowVariant: 'none',
  widthVariant: 'none',
  wrapVariant: 'wrapAnywhere',
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
    // webkit scrollbars
    '::-webkit-scrollbar': {
      width: '0.7em',
      background: 'transparent',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#00000033',
    },
    // firefox scrollbars
    'scrollbar-color': '#00000033 transparent !important',
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

const ActiveDropzoneOverlay = () => (
  <Styled
    position="absolute"
    left={0}
    top={0}
    bottom={0}
    right={0}
    bg="gray.4"
    opacity={0.3}
  />
)

const DropzoneChild = forwardRef(({ children, dropzone, ...others }, ref) => {
  const dropzoneProps = {}
  if (dropzone.onDrop) {
    dropzoneProps.drop = dropzone.onDrop
  }
  if (dropzone.accepts) {
    dropzoneProps.accept = dropzone.accepts
  }
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: 'BaseControl',
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    ...dropzoneProps,
  })
  const isActive = canDrop && isOver
  return (
    <Styled ref={forkRef(dropRef, ref)} position="relative" {...others}>
      {children}
      {isActive && <ActiveDropzoneOverlay />}
    </Styled>
  )
})

const View = forwardRef(({ children, onLayout, dropzone, ...others }, ref) => {
  const viewRef = useRef(null)
  const clientRect = {}
  const _onLayout = useCallback(
    (_clientRect) => {
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
  // useEffect(() => {
  //   if (IS_NATIVE) {
  //     return () => null
  //   }
  //   function onWindowResize() {
  //     if (!onLayout || !viewRef || !viewRef.current) {
  //       // only do expensive dimension stuff if we care
  //       return () => null
  //     }
  //     const { x, y, width, height } = viewRef.current.getBoundingClientRect()
  //     _onLayout({ x, y, width, height })
  //     return () => null
  //   }
  //   window.addEventListener('resize', onWindowResize)
  //   onWindowResize()
  //   return function cleanup() {
  //     window.removeEventListener('resize', onWindowResize)
  //   }
  // })
  if (onLayout) {
    console.warn('onLayout removed until optimized')
  }

  const ChildContainer = dropzone ? DropzoneChild : Styled

  // fixes white space in scroll bar when using external mouse
  const view = (
    <ChildContainer
      ref={forkRef(viewRef, ref)}
      {...defaultProps}
      {...(IS_NATIVE ? nativeProps : webProps)}
      {...others}
      dropzone={dropzone}
    >
      {children}
    </ChildContainer>
  )

  if (others.theme) {
    return <ThemeProvider theme={others.theme}>{view}</ThemeProvider>
  }

  return view
})

export default View
