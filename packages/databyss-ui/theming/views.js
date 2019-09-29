import { Platform } from 'react-native'
import colors from './colors'

export const pxUnits = Platform.select({
  ios: v => v,
  android: v => v,
  default: v => `${v}px`,
})

const borderRadius = pxUnits(5)

const paddingVariants = {
  none: { padding: pxUnits(0) },
  tiny: { padding: pxUnits(3) },
  small: { padding: pxUnits(8) },
  medium: { padding: pxUnits(16) },
  large: { padding: pxUnits(32) },
}

export const border = (thickness, color) => ({
  borderRadius,
  borderStyle: 'solid',
  borderColor: color,
  borderWidth: pxUnits(thickness),
})

const borderVariants = {
  none: border(0, colors.transparent),
  thinDark: border(1, colors.border[0]),
  thinLight: border(1, colors.border[1]),
  thickDark: border(3, colors.border[0]),
  thickLight: border(3, colors.border[1]),
}

export default {
  paddingVariants,
  borderVariants,
  borderRadius,
}
