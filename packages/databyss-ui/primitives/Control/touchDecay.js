import { keyframes } from '@emotion/core'
import timing from '../../theming/timing'

const decay = keyframes({
  '0%': {
    opacity: '0.4',
  },
  '100%': {
    opacity: 0,
  },
})

export const animatingCss = {
  '&:after': {
    animation: `${decay} ${timing.touchDecay}ms ${timing.ease}`,
  },
}
