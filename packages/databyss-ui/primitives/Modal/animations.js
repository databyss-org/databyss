/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from 'react'
import { keyframes as makeKeyframes } from '@emotion/core'
import theme from '../../theming/theme'

const reverseKeyframes = keyframes => ({
  '0%': {
    ...keyframes['100%'],
  },
  '100%': {
    ...keyframes['0%'],
  },
})

const animationCss = (animation, duration, timing) => ({
  animation,
  animationDuration: `${duration}ms`,
  animationTimingFunction: timing,
})

const makeAnimation = (keyframes, duration, timing) => {
  const [state, setState] = useState(false)
  const animationKeyframes = makeKeyframes(keyframes)

  return {
    css: state && animationCss(animationKeyframes, duration, timing),
    run: onComplete => {
      setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
        setState(false)
      }, duration)
      setState(true)
    },
  }
}

const makeAnimations = (
  keyframes,
  duration = theme.timing.medium,
  timing = theme.timing.easeOut
) =>
  Object.keys(keyframes).reduce((acc, key) => {
    acc[key] = {
      intro: makeAnimation(keyframes[key], duration, timing),
      outro: makeAnimation(reverseKeyframes(keyframes[key]), duration, timing),
    }
    return acc
  }, {})

export default makeAnimations
