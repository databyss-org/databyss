export const pxUnits = (v) => `${v}px`

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
  thinLight: border(1, 'border.3'),
  thickDark: border(3, 'border.0'),
  thickLight: border(3, 'border.3'),
  formField: border(2, 'border.2'),
  formError: border(2, 'red.0'),
  activeFormField: border(2, 'primary.0'),
  round: { borderRadius: '50%' },
}

const hlineVariants = {
  none: hline(0, 'transparent'),
  thinDark: hline(1, 'border.0'),
  thinLight: hline(1, 'border.3'),
  thickDark: hline(3, 'border.0'),
  thickLight: hline(3, 'border.3'),
}

export const widthVariants = {
  none: {},
  headline: {
    maxWidth: pxUnits(500),
  },
  content: {
    maxWidth: pxUnits(700),
  },
  form: {
    maxWidth: pxUnits(550),
  },
  dropdownMenuSmall: {
    minWidth: pxUnits(120),
  },
  dropdownMenuMedium: {
    minWidth: pxUnits(200),
  },
  dropdownMenuLarge: {
    minWidth: pxUnits(300),
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

export const heightVariants = {
  none: {},
  dropdownMenuItem: {
    minHeight: pxUnits(34),
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

const wrapVariants = {
  none: {},
  wrapAnywhere: {
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  },
}

export default {
  paddingVariants,
  borderVariants,
  widthVariants,
  heightVariants,
  hlineVariants,
  borderRadiusVariants,
  wrapVariants,
}
