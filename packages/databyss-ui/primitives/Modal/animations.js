/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useRef } from 'react'
import { keyframes as makeKeyframes } from '@emotion/core'
import { timing as themeTiming } from '../../theming/theme'

const reverseKeyframes = (keyframes) => ({
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
  const timerRef = useRef(null)
  const animationKeyframes = makeKeyframes(keyframes)

  // stop all timers on unmount
  useEffect(() => () => clearTimeout(timerRef.current), [timerRef])

  return {
    css: state && animationCss(animationKeyframes, duration, timing),
    run: (onComplete) => {
      timerRef.current = setTimeout(() => {
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
  duration = themeTiming.medium,
  timing = themeTiming.easeOut
) =>
  Object.keys(keyframes).reduce((acc, key) => {
    acc[key] = {
      intro: makeAnimation(keyframes[key], duration, timing),
      outro: makeAnimation(reverseKeyframes(keyframes[key]), duration, timing),
    }
    return acc
  }, {})

export default makeAnimations
