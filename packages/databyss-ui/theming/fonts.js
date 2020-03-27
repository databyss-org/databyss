import { Platform } from 'react-native'
import { isMobileOs } from '../lib/mediaQuery'

export const serif = Platform.select({
  ios: 'Baskerville',
  android: 'serif',
  default: 'PT Serif, serif',
})

export const sans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'Source Sans Pro, sans-serif',
})

export const mono = Platform.select({
  ios: '"American Typewriter"',
  android: 'monospace',
  default: 'SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace',
})

export const pxUnits = Platform.select({
  ios: v => v,
  android: v => v,
  default: v => `${v}px`,
})

export const weightUnits = Platform.select({
  ios: v => `${v}`,
  android: v => `${v}`,
  default: v => v,
})

export const underline = Platform.select({
  ios: { textDecorationLine: 'underline' },
  android: { textDecorationLine: 'underline' },
  default: {
    textDecoration: 'underline',
  },
})

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

const headingText = size => ({
  fontFamily: fonts.headingFont,
  fontWeight: fontWeights.bold,
  fontSize: size,
  lineHeight: pxUnits(size * 1.15),
})

const uiText = size => ({
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
  uiTextLarge: uiText(22),
  uiTextNormal: uiText(16),
  uiTextSmall: uiText(14),
  uiTextTiny: uiText(10),
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

const bodyHeader = size => ({
  fontFamily: fonts.bodyFont,
  fontSize: size,
  lineHeight: pxUnits(size * 1.75),
  fontWeight: fontWeights.regular,
})

const bodyText = size => ({
  fontFamily: fonts.bodyFont,
  fontSize: size,
  lineHeight: pxUnits(size * 1.5),
  fontWeight: fontWeights.regular,
})

const bodyVariants = {
  bodyLarge: bodyText(22),
  bodyHeader: bodyHeader(20),
  bodyNormal: bodyText(isMobileOs() ? 16 : 15),
  bodySmall: bodyText(isMobileOs() ? 14 : 13),
}

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
}

export default {
  fonts,
  fontWeights,
  textVariants,
}
