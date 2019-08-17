import { Platform } from 'react-native'
import colors from './colors'
import { isMobileOrMobileOs } from '../lib/mediaQuery'

export const nativePropVariants = {
  default: {
    underlayColor: colors.gray[3],
  },
}

const controlVariants = {
  default: {
    ...Platform.select({
      ios: {},
      android: {},
      default: isMobileOrMobileOs()
        ? {}
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
}

export default {
  controlVariants,
}
