import React, { useState, useRef, useEffect } from 'react'
import { keyframes } from '@emotion/core'
import { isMobileOrMobileOs } from '../../../lib/mediaQuery'
import styled from '../../styled'
import theme from '../../../theming/theme'

const decay = keyframes({
  '0%': {
    opacity: '0.4',
  },
  '100%': {
    opacity: 0,
  },
})

const controlCss = {
  '&:hover': {
    backgroundColor: theme.colors.controlHover,
  },
  '&:active': {
    backgroundColor: theme.colors.controlActive,
  },
  cursor: 'pointer',
}

const controlCssMobile = {
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '-4px',
    bottom: '-4px',
    left: '-4px',
    right: '-4px',
    backgroundColor: theme.colors.controlRippleColor,
    opacity: 0,
    borderRadius: '3px',
  },
}

const animatingCss = {
  '&:after': {
    animation: `${decay} ${theme.timing.touchDecay}ms ${theme.timing.ease}`,
  },
}

const Styled = styled('div')

export default ({ disabled, children, onPress, ...others }) => {
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
        !disabled && (isMobileOrMobileOs() ? controlCssMobile : controlCss),
        !disabled && decay && animatingCss,
      ]}
      {...others}
    >
      {children}
    </Styled>
  )
}
