import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import css from '@styled-system/css'
import { ThemeContext } from '@emotion/core'
import forkRef from '@databyss-org/ui/lib/forkRef'
import Color from 'color'
import View, { styleProps, defaultProps, webProps } from '../../View/View'
import styled from '../../styled'
import { isMobileOs } from '../../../lib/mediaQuery'
import { borderRadius, timing } from '../../../theming/theme'

const resetProps = {
  padding: 0,
  border: 'none',
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
  ...webProps,
}

const controlCssDesktop = (props, theme) => ({
  cursor: 'pointer',
  transition: `background-color ${timing.flash}ms ${timing.ease}`,
  ...(props.active
    ? {
        backgroundColor: props.activeColor,
      }
    : {
        '&[data-focusvisible-polyfill]': {
          borderStyle: 'solid',
          borderColor: 'primary.0',
          borderRadius,
          boxShadow: `0 0 0 5px ${Color(
            css({ color: 'primary.0' })(theme).color
          )
            .alpha(0.6)
            .rgb()
            .string()}`,
        },
        '&:hover': {
          backgroundColor: props.hoverColor,
        },
        '&:active': {
          backgroundColor: props.pressedColor,
        },
      }),
})

const controlCssMobile = () => ({
  transition: `background-color ${timing.medium}ms ${timing.ease}`,
  '&:active': {
    transition: `background-color ${timing.quick}ms ${timing.easeOut}`,
  },
})

const controlCss = (props) => ({
  position: 'relative',
  userSelect: props.userSelect,
  borderWidth: '1px',
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
})

const _mobile = isMobileOs()

export const ControlNoFeedback = ({ children, ...others }) => (
  <View {...others}>{children}</View>
)

const StyledButton = styled('button', styleProps)
const StyledLink = styled('a', styleProps)

const Control = forwardRef(
  (
    { disabled, children, onPress, renderAsView, href, handle, ...others },
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
    return (
      <ThemeContext.Consumer>
        {(theme) => (
          <StyledComponent
            onDragStart={(e) => e.preventDefault()}
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
            {...(renderAsView ? {} : viewProps)}
            css={[
              !renderAsView && resetCss,
              css(controlCss(others))(theme),
              _mobile && css(controlCssMobile(others))(theme),
              !_mobile && css(controlCssDesktop(others, theme))(theme),
            ]}
            href={href}
            disabled={disabled}
            {...others}
          >
            {children}
          </StyledComponent>
        )}
      </ThemeContext.Consumer>
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

export default Control
