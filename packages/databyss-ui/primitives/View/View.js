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
import { ThemeContext } from '@emotion/core'
import forkRef from '@databyss-org/ui/lib/forkRef'
import fastCompare from 'react-fast-compare'
import applyTheme from '@styled-system/css'
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

export const heightVariant = variant({
  prop: 'heightVariant',
  scale: 'heightVariants',
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
  heightVariant,
  widthVariant,
  borderRadiusVariant,
  wrapVariant
)

export const defaultProps = {
  paddingVariant: 'none',
  borderVariant: 'none',
  shadowVariant: 'none',
  heightVariant: 'none',
  widthVariant: 'none',
  wrapVariant: 'wrapAnywhere',
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'auto',
  overflow: 'visible',
  display: 'flex',
  flexDirection: 'column',
}

export const scrollbarResetCss = {
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
}

export const desktopResetCss = {
  boxSizing: 'border-box',
  ...scrollbarResetCss,
}

const desktopCss = (props) => ({
  ...(props.hoverColor
    ? {
        '&:hover': {
          backgroundColor: props.hoverColor,
        },
      }
    : {}),
})

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

const View = forwardRef(
  ({ children, onLayout, dropzone, theme, css, ...others }, ref) => {
    const viewRef = useRef(null)
    // const clientRect = {}
    // const _onLayout = useCallback(
    //   (_clientRect) => {
    //     if (onLayout && !fastCompare(_clientRect, clientRect)) {
    //       onLayout(clientRect)
    //     }
    //     Object.assign(clientRect, _clientRect)
    //   },
    //   [clientRect]
    // )
    // const nativeProps = {
    //   onLayout: () =>
    //     onLayout &&
    //     viewRef &&
    //     viewRef.current &&
    //     viewRef.current.measure((x, y, width, height) =>
    //       _onLayout({ x, y, width, height })
    //     ),
    // }

    const ChildContainer = dropzone ? DropzoneChild : Styled

    // fixes white space in scroll bar when using external mouse
    const view = (_theme) => (
      <ChildContainer
        ref={forkRef(viewRef, ref)}
        {...defaultProps}
        // {...(IS_NATIVE ? nativeProps : {})}
        css={[
          !IS_NATIVE && desktopResetCss,
          !IS_NATIVE && applyTheme(desktopCss(others))(_theme),
          css,
        ]}
        theme={_theme}
        {...others}
        dropzone={dropzone}
      >
        {children}
      </ChildContainer>
    )

    if (theme) {
      return <ThemeProvider theme={theme}>{view(theme)}</ThemeProvider>
    }

    return (
      <ThemeContext.Consumer>{(_theme) => view(_theme)}</ThemeContext.Consumer>
    )
  }
)

View.defaultProps = {
  css: {},
}

export default View
