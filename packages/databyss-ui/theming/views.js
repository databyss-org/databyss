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

const hoverVariants = {
  formatMenuUI: {
    // paddingTop: pxUnits(8),
    paddingLeft: pxUnits(7),
    // paddingBottom: pxUnits(6),
    paddingRight: pxUnits(7),
    backgroundColor: 'background.6',
    zIndex: 1,
    top: pxUnits(-10000),
    left: pxUnits(-10000),
    marginTop: pxUnits(-6),
    position: 'absolute',
    opacity: 0,
    transition: 'opacity 0.75s',
    borderRadius,
  },
}

export default {
  paddingVariants,
  borderVariants,
  hoverVariants,
}
