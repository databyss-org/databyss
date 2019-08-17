import { Platform } from 'react-native'
import colors from './colors'
import { isMobileOrMobileOs } from '../lib/mediaQuery'

export const nativePropVariants = {
  default: {
    underlayColor: colors.gray[3],
  },
}

const mobileWebControl = color => ({
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '-4px',
    bottom: '-4px',
    left: '-4px',
    right: '-4px',
    backgroundColor: color,
    opacity: 0,
    borderRadius: '3px',
  },
})

const controlVariants = {
  default: {
    ...Platform.select({
      ios: {},
      android: {},
      default: isMobileOrMobileOs()
        ? mobileWebControl(colors.gray[1])
        : {
            '&:hover': {
              backgroundColor: colors.gray[6],
            },
            '&:active': {
              backgroundColor: colors.gray[5],
            },
            cursor: 'pointer',
          },
    }),
  },
  disabled: {
    opacity: 0.5,
  },
}

export default {
  controlVariants,
}
