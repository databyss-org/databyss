import React, { useState, useRef, useEffect } from 'react'
import { keyframes } from '@emotion/core'
import { View } from '../../'
import { isMobileOrMobileOs } from '../../../lib/mediaQuery'
import theme from '../../../theming/theme'

const decay = keyframes({
  '0%': {
    opacity: '0.5',
  },
  '100%': {
    opacity: 0,
  },
})

const controlCssDesktop = {
  cursor: 'pointer',
  '&:hover': {
    '&:after': {
      opacity: '0.2',
    },
  },
  '&:active': {
    '&:after': {
      opacity: '0.6',
    },
  },
}

const controlCss = props => ({
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: props.rippleColor,
    opacity: 0,
    borderRadius: props.borderRadius,
    transition: `opacity ${theme.timing.flash}ms ${theme.timing.ease}`,
  },
})

const animatingCss = {
  '&:after': {
    animation: `${decay} ${theme.timing.touchDecay}ms ${theme.timing.ease}`,
  },
}

const Styled = View

export const ControlNoFeedback = ({ children, ...others }) => (
  <Styled {...others}>{children}</Styled>
)

const Control = ({ disabled, children, onPress, ...others }) => {
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
    <Styled
      onClick={e => {
        if (disabled) {
          return
        }
        if (onPress) {
          onPress(e)
        }
        if (!isMobileOrMobileOs()) {
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
        !disabled && controlCss(others),
        !disabled && !isMobileOrMobileOs() && controlCssDesktop,
        !disabled && isMobileOrMobileOs() && decay && animatingCss,
      ]}
      {...others}
    >
      {children}
    </Styled>
  )
}

Control.defaultProps = {
  rippleColor: theme.colors.controlRippleColor,
  borderRadius: '3px',
}

export default Control
