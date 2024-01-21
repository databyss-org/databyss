import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import css from '@styled-system/css'
import forkRef from '@databyss-org/ui/lib/forkRef'
import { withTheme } from 'emotion-theming'
import View, {
  styleProps,
  defaultProps,
  desktopResetCss,
} from '../../View/View'
import styled from '../../styled'
import { isMobileOs } from '../../../lib/mediaQuery'
import  { borderRadius, timing } from '../../../theming/theme'

const resetProps = {
  padding: 0,
  border: 0,
  font: 'inherit',
  color: 'inherit',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  alignItems: 'unset',
}

const resetCss = {
  textAlign: 'left',
}

const viewProps = {
  ...resetProps,
  ...defaultProps,
}

const controlCssDesktop = (props) => ({
  cursor: 'pointer',
  transition: `background-color ${timing.flash}ms ${timing.ease}`,
  ...(props.active
    ? {
        backgroundColor: props.activeColor,
      }
    : {}),
  ...(!props.focusVisible
    ? {
        '&[data-focusvisible-polyfill]': {
          outlineStyle: 'solid',
          outlineWidth: '1.5px',
          outlineColor: 'primary.0',
          outlineOffset: '-3px',
          // borderRadius,
        },
      }
    : {
        '&:focus': {
          outlineStyle: 'solid',
          outlineWidth: '1.5px',
          outlineColor: 'primary.0',
          outlineOffset: '-3px',
          // borderRadius,
        },
      }),
  ...(props.focusActive
    ? {
        '&:focus': {
          backgroundColor: props.activeColor,
        },
      }
    : {}),
  '&:hover:not(:focus)': {
    backgroundColor: props.hoverColor,
  },
  '&:active': {
    backgroundColor: props.pressedColor,
  },
})

const controlCssMobile = () => ({
  transition: `background-color ${timing.medium}ms ${timing.ease}`,
  '&:active': {
    transition: `background-color ${timing.quick}ms ${timing.easeOut}`,
  },
})

const controlCss = (props) => ({
  position: props.position ?? 'relative',
  userSelect: props.userSelect,
  // borderWidth: props.borderWidth ?? 0,
  // marginRight: props.marginRight ?? '1px',
  textDecoration: 'none',
  '&:active': {
    backgroundColor: props.pressedColor,
  },
  '&:focus': {
    outline: 'none',
  },
  ...(props.active
    ? {
        backgroundColor: props.activeColor,
      }
    : {}),
  ...(props.css ?? {}),
})

const _mobile = isMobileOs()

export const ControlNoFeedback = ({ children, ...others }) => (
  <View {...others}>{children}</View>
)

const StyledButton = styled('button', styleProps)
const StyledLink = styled('a', styleProps)

const Control = forwardRef(
  (
    {
      disabled,
      children,
      onPress,
      renderAsView,
      href,
      handle,
      draggable,
      theme,
      ...others
    },
    ref
  ) => {
    const _childRef = useRef()
    useImperativeHandle(handle, () => ({
      press: () => {
        if (_childRef.current?.click) {
          _childRef.current.click()
        }
      },
    }))
    const StyledControl = href ? StyledLink : StyledButton
    const StyledComponent = renderAsView ? View : StyledControl
    /* eslint-disable-next-line */
    const { css: _, ...filteredOthers } = others
    const _computedCss = useMemo(() => ([
      !renderAsView && resetCss,
      css(controlCss(others))(theme),
      _mobile && css(controlCssMobile(others))(theme),
      !_mobile && desktopResetCss,
      !_mobile && css(controlCssDesktop(others, theme))(theme),
      draggable && {
        // note this is necessary to remove extra junk around the edges of the
        // drag preview. see: https://github.com/react-dnd/react-dnd/issues/788#issuecomment-393620979
        transform: 'translate(0, 0)',
        cursor: 'grab',
      },
    ]), [
      theme,
      renderAsView,
      others.active, 
      others.focusVisible, 
      others.focusActive, 
      others.css
    ])
    return (
      <StyledComponent
        ref={forkRef(ref, _childRef)}
        tabIndex={0}
        onClick={(e) => {
          if (disabled) {
            return
          }
          if (e.getModifierState && e.getModifierState('Meta')) {
            return
          }
          if (onPress) {
            onPress(e)
          }
        }}
        {...(draggable ? {} : { onDragStart: (e) => e.preventDefault() })}
        {...(renderAsView ? {} : viewProps)}
        css={_computedCss}
        href={href}
        disabled={disabled}
        {...filteredOthers}
      >
        {children}
      </StyledComponent>
    )
  }
)

Control.defaultProps = {
  hoverColor: 'control.2',
  activeColor: 'control.2',
  pressedColor: 'control.1',
  borderRadius,
  userSelect: 'none',
}

export default withTheme(Control)
