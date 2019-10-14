import React, { useState, useRef, useEffect, forwardRef } from 'react'
import css from '@styled-system/css'
import { keyframes, ThemeContext } from '@emotion/core'
import { View } from '../../'
import { isMobileOs } from '../../../lib/mediaQuery'
import theme, { borderRadius } from '../../../theming/theme'

const decay = keyframes({
  '0%': {
    opacity: 0.8,
  },
  '100%': {
    opacity: 0,
  },
})

const controlCssDesktop = props => ({
  cursor: 'pointer',
  transition: `background-color ${theme.timing.flash}ms ${theme.timing.ease}`,
  ...(props.active
    ? {
        backgroundColor: props.activeColor,
      }
    : {
        '&:hover': {
          backgroundColor: props.hoverColor,
        },
        '&:active': {
          backgroundColor: props.activeColor,
        },
      }),
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

const controlCss = props => ({
  position: 'relative',
  ...(props.active
    ? {
        backgroundColor: props.activeColor,
      }
    : {}),
  '&:after': {
    ..._pseudomaskCss(props),
    backgroundColor: props.rippleColor,
  },
})

const animatingCss = {
  '&:after': {
    animation: `${decay} ${theme.timing.touchDecay}ms ${theme.timing.ease}`,
  },
}

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
          <View
            ref={ref}
            onClick={e => {
              if (disabled) {
                return
              }
              if (onPress) {
                onPress(e)
              }
              if (!isMobileOs()) {
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
            css={[
              !disabled && css(controlCss(others))(theme),
              !disabled &&
                !isMobileOs() &&
                css(controlCssDesktop(others))(theme),
              !disabled && isMobileOs() && decay && animatingCss,
            ]}
            {...others}
          >
            {children}
          </View>
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
