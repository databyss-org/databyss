/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from 'react'
import { keyframes } from '@emotion/core'
import theme from '../../theming/theme'

const makeKeyframes = intro => ({
  intro: keyframes(intro),
  outro: keyframes({
    '0%': {
      ...intro['100%'],
    },
    '100%': {
      ...intro['0%'],
    },
  }),
})

const animationCss = animation => ({
  animation,
  animationDuration: `${theme.timing.medium}ms`,
  animationTimingFunction: theme.timing.easeOut,
})

const makeRunner = (key, animationStates) => onComplete => {
  setTimeout(() => {
    if (onComplete) {
      onComplete()
    }
    animationStates[key].set(false)
  }, theme.timing.medium)
  animationStates[key].set(true)
}

const makeAnimation = () => {
  const animations = makeKeyframes({
    '0%': {
      top: '100%',
    },
    '100%': {
      top: 0,
    },
  })
  const css = {
    intro: animationCss(animations.intro),
    outro: animationCss(animations.outro),
  }
  const [introState, setIntroState] = useState(false)
  const [outroState, setOutroState] = useState(false)
  const states = {
    intro: {
      get: introState,
      set: v => setIntroState(v),
    },
    outro: {
      get: outroState,
      set: v => setOutroState(v),
    },
  }
  const runners = {
    intro: makeRunner('intro', states),
    outro: makeRunner('outro', states),
  }
  const getCssFor = key => states[key].get && css[key]
  const run = (key, onComplete) => runners[key](onComplete)

  return {
    getCssFor,
    run,
  }
}

export default () => ({
  slide: makeAnimation(),
})
