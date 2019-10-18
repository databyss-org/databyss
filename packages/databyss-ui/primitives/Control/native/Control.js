import React, { useState, useRef, useEffect, forwardRef } from 'react'
import css from '@styled-system/css'
import { keyframes, ThemeContext } from '@emotion/core'
import View, { styleProps, defaultProps, webProps } from '../../View/View'
import styled from '../../styled'
import { isMobileOs } from '../../../lib/mediaQuery'
import theme, { borderRadius } from '../../../theming/theme'

const Styled = styled('button', styleProps)

const decay = keyframes({
  '0%': {
    opacity: 0.8,
  },
  '100%': {
    opacity: 0,
  },
})

const _pseudomaskCss = () => ({
  content: '""',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  opacity: 0,
})

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

const controlCssDesktop = props => ({
  cursor: 'pointer',
  transition: `background-color ${theme.timing.flash}ms ${theme.timing.ease}`,
  ...(props.active
    ? {
        backgroundColor: props.activeColor,
      }
    : {
        '&:focus:before': {
          ..._pseudomaskCss(props),
          zIndex: 0,
          opacity: 0.8,
          backgroundColor: props.hoverColor,
        },
        '&:hover': {
          backgroundColor: props.hoverColor,
        },
        '&:active': {
          backgroundColor: props.activeColor,
        },
      }),
})

const controlCssMobile = props => ({
  '&:after': {
    ..._pseudomaskCss(props),
    backgroundColor: props.rippleColor,
  },
})

const controlCss = props => ({
  position: 'relative',
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

const animatingCss = {
  '&:after': {
    animation: `${decay} ${theme.timing.touchDecay}ms ${theme.timing.ease}`,
  },
}

const _mobile = isMobileOs()

export const ControlNoFeedback = ({ children, ...others }) => (
  <View {...others}>{children}</View>
)

const Control = forwardRef(
  ({ disabled, children, onPress, ...others }, ref) => {
    const [decay, setDecay] = useState(false)
    const [resetDecay, setResetDecay] = useState(false)
    const decayTimerRef = useRef(null)
    const startDecayAnimation = () => {
      decayTimerRef.current = setTimeout(
        () => setDecay(false),
        theme.timing.touchDecay
      )
      setDecay(true)
    }
    useEffect(() => () => clearTimeout(decayTimerRef.current), [decayTimerRef])
    useEffect(
      () => {
        if (resetDecay) {
          startDecayAnimation()
          setResetDecay(false)
        }
      },
      [resetDecay]
    )
    return (
      <ThemeContext.Consumer>
        {theme => (
          <Styled
            ref={ref}
            tabIndex={0}
            onClick={e => {
              if (disabled) {
                return
              }
              if (onPress) {
                onPress(e)
              }
              if (!_mobile) {
                return
              }
              if (decay) {
                clearTimeout(decayTimerRef.current)
                setDecay(false)
                setResetDecay(true)
              } else {
                startDecayAnimation()
              }
            }}
            {...viewProps}
            css={[
              resetCss,
              css(controlCss(others))(theme),
              _mobile && css(controlCssMobile(others))(theme),
              !_mobile && css(controlCssDesktop(others))(theme),
              !disabled && _mobile && decay && animatingCss,
            ]}
            {...others}
          >
            {children}
          </Styled>
        )}
      </ThemeContext.Consumer>
    )
  }
)

Control.defaultProps = {
  rippleColor: 'background.3',
  hoverColor: 'background.2',
  activeColor: 'background.3',
  borderRadius,
}

export default Control
