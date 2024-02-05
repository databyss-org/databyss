export const serif = 'PT Serif, serif'

export const sans = 'Source Sans Pro, sans-serif'

export const mono =
  'SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace'

export const pxUnits = (v) => `${v}px`

export const weightUnits = (v) => v

export const underline = {
  textDecoration: 'underline',
  textDecorationSkipInk: 'none',
  textDecorationSkip: 'none',
}

const fonts = {
  sans,
  serif,
  mono,
}

fonts.headingFont = fonts.sans
fonts.bodyFont = fonts.serif
fonts.uiFont = fonts.sans

const fontWeights = [400, 600, 700].map(weightUnits)
fontWeights.bold = fontWeights[2]
fontWeights.semiBold = fontWeights[1]
fontWeights.regular = fontWeights[0]

const headingText = (size) => ({
  fontFamily: fonts.headingFont,
  fontWeight: fontWeights.bold,
  fontSize: size,
  lineHeight: pxUnits(size * 1.15),
})

const uiText = (size) => ({
  fontFamily: fonts.uiFont,
  fontSize: size,
  fontWeight: fontWeights.normal,
})

const headingVariants = {
  heading1: headingText(72),
  heading2: headingText(48),
  heading3: headingText(30),
  heading4: headingText(24),
}

const uiTextVariants = {
  uiTextExtraLarge: uiText(28),
  uiTextLarge: uiText(22),
  uiTextMedium: uiText(18),
  uiTextNormal: uiText(16),
  uiTextMediumLong: {
    ...uiText(18),
    fontWeight: 300,
    lineHeight: pxUnits(28),
  },
  uiTextMultiline: {
    ...uiText(14),
    lineHeight: pxUnits(17.5),
  },
  uiTextSmall: uiText(14),
  uiTextTiny: uiText(10),
  uiTextSmallCaps: {
    ...uiText(10),
    textTransform: 'uppercase',
  },
  uiTextHeading: {
    fontFamily: fonts.uiFont,
    fontSize: 13,
    letterSpacing: '0.8px',
    fontWeight: fontWeights.semiBold,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
}

const uiTextBoldVariants = Object.keys(uiTextVariants).reduce(
  (variants, vk) => ({
    ...variants,
    [`${vk}Semibold`]: {
      ...uiTextVariants[vk],
      fontWeight: fontWeights.semiBold,
    },
  }),
  {}
)

const uitextItalicVariants = Object.keys(uiTextVariants).reduce(
  (variants, vk) => ({
    ...variants,
    [`${vk}Italic`]: {
      ...uiTextVariants[vk],
      fontStyle: 'italic',
    },
  }),
  {}
)

const uiTextUnderlineVariants = Object.keys(uiTextVariants).reduce(
  (variants, vk) => ({
    ...variants,
    [`${vk}Underline`]: {
      ...uiTextVariants[vk],
      ...underline,
    },
  }),
  {}
)

const uiTextBoldUnderlineVariants = Object.keys(uiTextBoldVariants).reduce(
  (variants, vk) => ({
    ...variants,
    [`${vk}Underline`]: {
      ...uiTextBoldVariants[vk],
      ...underline,
    },
  }),
  {}
)

const bodyHeading = (size) => ({
  fontFamily: fonts.bodyFont,
  fontSize: size,
  lineHeight: pxUnits(size * 1.25),
  fontWeight: fontWeights.regular,
})

const bodyText = (size) => ({
  fontFamily: fonts.bodyFont,
  fontSize: size,
  lineHeight: pxUnits(size * 1.5),
  fontWeight: fontWeights.regular,
})

const bodyVariants = {
  bodyHeading1: bodyHeading(26),
  bodyHeading2: bodyText(22),
  bodyHeading3: bodyText(18),
  bodyNormal: bodyText(16),
  bodySmall: bodyText(14),
  bodySectionHeading1: {
    ...bodyHeading(38),
    'font-variant': 'all-small-caps',
  },
}

const foundationVariants = {
  foundationLogoNormal: {
    ...bodyText(20),
    lineHeight: pxUnits(22),
  },
  foundationLogoSmall: {
    ...bodyText(14),
    lineHeight: pxUnits(15),
  },
}
// const foundationVariants = {
//   foundationLogoNormal: {
//     ...bodyText(13),
//     lineHeight: pxUnits(15),
//   },
//   foundationLogoSmall: {
//     ...bodyText(11),
//     lineHeight: pxUnits(12),
//   },
// }

const bodyBoldVariants = Object.keys(bodyVariants).reduce(
  (variants, vk) => ({
    ...variants,
    [`${vk}Semibold`]: {
      ...bodyVariants[vk],
      fontWeight: fontWeights.semiBold,
    },
  }),
  {}
)

const bodyUnderlineVariants = Object.keys(bodyVariants).reduce(
  (variants, vk) => ({
    ...variants,
    [`${vk}Underline`]: {
      ...bodyVariants[vk],
      ...underline,
    },
  }),
  {}
)

const bodyItalicVariants = Object.keys(bodyVariants).reduce(
  (variants, vk) => ({
    ...variants,
    [`${vk}Italic`]: {
      ...bodyVariants[vk],
      fontStyle: 'italic',
    },
  }),
  {}
)

const bodyBoldItalicVariants = Object.keys(bodyBoldVariants).reduce(
  (variants, vk) => ({
    ...variants,
    [`${vk}Italic`]: {
      ...bodyBoldVariants[vk],
      fontStyle: 'italic',
    },
  }),
  {}
)

const textVariants = {
  ...headingVariants,
  ...uiTextVariants,
  ...uiTextBoldVariants,
  ...uitextItalicVariants,
  ...uiTextUnderlineVariants,
  ...uiTextBoldUnderlineVariants,
  ...bodyVariants,
  ...bodyUnderlineVariants,
  ...bodyBoldVariants,
  ...bodyItalicVariants,
  ...bodyBoldItalicVariants,
  ...foundationVariants,
}

export default {
  fonts,
  fontWeights,
  textVariants,
}
