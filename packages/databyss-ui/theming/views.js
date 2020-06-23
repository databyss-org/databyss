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

export const hline = (thickness, color) => ({
  borderBottomStyle: 'solid',
  borderBottomColor: color,
  borderBottomWidth: pxUnits(thickness),
})

const borderVariants = {
  none: border(0, 'transparent'),
  thinDark: border(1, 'border.0'),
  thinLight: border(1, 'border.2'),
  thickDark: border(3, 'border.0'),
  thickLight: border(3, 'border.2'),
  formField: border(2, 'border.1'),
  formError: border(2, 'red.0'),
  activeFormField: border(2, 'primary.0'),
}

const hlineVariants = {
  none: hline(0, 'transparent'),
  thinDark: hline(1, 'border.0'),
  thinLight: hline(1, 'border.2'),
  thickDark: hline(3, 'border.0'),
  thickLight: hline(3, 'border.2'),
}

const widthVariants = {
  none: {},
  content: {
    maxWidth: pxUnits(500),
  },
  form: {
    maxWidth: pxUnits(550),
  },
  modal: {
    maxWidth: pxUnits(850),
  },
  dialog: {
    maxWidth: pxUnits(320),
  },
  page: {
    maxWidth: pxUnits(950),
  },
}

const borderRadiusVariants = {
  none: {
    borderRadius: 0,
  },
  default: {
    borderRadius,
  },
  round: {
    borderRadius: '50%',
  },
}

export default {
  paddingVariants,
  borderVariants,
  widthVariants,
  hlineVariants,
  borderRadiusVariants,
}
