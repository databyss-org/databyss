import { Platform } from 'react-native'

export const EM = 16

export const serif = Platform.select({
  ios: 'Baskerville',
  android: 'serif',
  default: 'Baskerville, serif',
})

const fontBase = {
  headingFont: serif,
  bodyFont: serif,
  navFont: '-apple-system',
  fontSizeBase: EM,
  fontBold: 700,
  fontSemibold: 600,
}

export default {
  ...fontBase,
  lineHeightContent: 1.3 * EM,
  fontSizeNormal: EM,
  fontSizeS: 0.85 * EM,
  fontSizeXs: 0.7 * EM,
  fontSizeL: 1.2 * EM,
}
