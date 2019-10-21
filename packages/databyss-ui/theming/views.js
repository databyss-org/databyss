import { Platform } from 'react-native'

export const pxUnits = Platform.select({
  // HACK: add 0.01 to tell YGValue that we want pt units not "em" (or equiv)
  ios: v => v + 0.01,
  android: v => v + 0.01,
  default: v => `${v}px`,
})

export const borderRadius = pxUnits(5)

const paddingVariants = {
  none: { padding: pxUnits(0) },
  tiny: { padding: pxUnits(3) },
  small: { padding: pxUnits(8) },
  medium: { padding: pxUnits(16) },
  large: { padding: pxUnits(32) },
}

export const border = (thickness, color) => ({
  borderRadius: thickness ? borderRadius : 0,
  borderStyle: 'solid',
  borderColor: color,
  borderWidth: pxUnits(thickness),
})

const borderVariants = {
  none: border(0, 'transparent'),
  thinDark: border(1, 'border.0'),
  thinLight: border(1, 'border.1'),
  thickDark: border(3, 'border.0'),
  thickLight: border(3, 'border.1'),
}

export default {
  paddingVariants,
  borderVariants,
}
