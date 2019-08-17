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

export default {
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '-4px',
    bottom: '-4px',
    left: '-4px',
    right: '-4px',
    backgroundColor: '#000',
    opacity: 0,
    borderRadius: '3px',
  },
}

export const animatingCss = {
  '&:after': {
    animation: `${decay} ${timing.touchDecay}ms ${timing.ease}`,
  },
}
