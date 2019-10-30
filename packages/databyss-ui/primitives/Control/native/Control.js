import React, { forwardRef } from 'react'
import css from '@styled-system/css'
import { ThemeContext } from '@emotion/core'
import Color from 'color'
import View, { styleProps, defaultProps, webProps } from '../../View/View'
import styled from '../../styled'
import { isMobileOs } from '../../../lib/mediaQuery'
import theme, { borderRadius } from '../../../theming/theme'

const StyledButton = styled('button', styleProps)

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
  transition: `background-color ${theme.timing.flash}ms ${theme.timing.ease}`,
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
          backgroundColor: props.activeColor,
        },
      }),
})

const controlCssMobile = () => ({
  transition: `background-color ${theme.timing.quick}ms ${
    theme.timing.easeOut
  }`,
})

const controlCss = props => ({
  position: 'relative',
  userSelect: props.userSelect,
  borderWidth: '1px',
  '&:active': {
    backgroundColor: props.activeColor,
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

const Control = forwardRef(
  ({ disabled, children, onPress, renderAsView, ...others }, ref) => {
    const StyledComponent = renderAsView || _mobile ? View : StyledButton
    return (
      <ThemeContext.Consumer>
        {theme => (
          <StyledComponent
            ref={ref}
            tabIndex={0}
            onClick={e => {
              if (disabled) {
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
  hoverColor: 'background.2',
  activeColor: 'background.3',
  borderRadius,
  userSelect: 'none',
}

export default Control
