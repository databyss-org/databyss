import { Platform } from 'react-native'
import colors from './colors'

export const pxUnits = Platform.select({
  ios: v => v,
  android: v => v,
  default: v => `${v}px`,
})

const paddingVariants = {
  none: { padding: pxUnits(0) },
  small: { padding: pxUnits(16) },
  medium: { padding: pxUnits(32) },
  large: { padding: pxUnits(64) },
}

const border = (thickness, color) => ({
  borderRadius: pxUnits(3),
  borderStyle: 'solid',
  borderColor: color,
  borderWidth: pxUnits(thickness),
})

const borderVariants = {
  none: border(0, colors.transparent),
  thinDark: border(1, colors.gray[1]),
  thinLight: border(1, colors.gray[4]),
  thickDark: border(3, colors.gray[1]),
  thickLight: border(3, colors.gray[4]),
}

export default {
  paddingVariants,
  borderVariants,
}
