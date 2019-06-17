import colors from './colors'

export default {
  /* layout */
  mobileWidth: '600px',
  desktopWidth: '1024px',
  maxPageWidth: '1024px',
  contentWidth: '500px',

  /* fonts */
  headingFont: "'Baskerville', serif",
  bodyFont: "'Baskerville', serif",
  navFont: "'-apple-system', 'Helvetica', sans-serif",
  fontSizeBase: '13pt',
  lineHeightContent: '1.3em',
  fontSizeNormal: '1em',
  fontSizeS: '0.85em',
  fontSizeXs: '0.7em',
  fontSizeL: '1.2em',
  fontSizeXL: '1.4em',
  fontBold: 700,
  fontSemibold: 600,

  /* colors */
  ...colors,
  bgColorDark: colors.darkGrey,
  bgColorLight: colors.lightGrey,
  textColorDark: colors.black,
  textColorLight: colors.white,
  textColorDarkSecondary: colors.darkGrey,
  focusOutlineColor: colors.pink,
  entrySourceColor: colors.lightPurple,

  /* transitions */
  slow: '800ms',
  medium: '500ms',
  quick: '300ms',
  superQuick: '100ms',
  ease: 'ease-in-out',
  touchDecayDuration: 800,

  /* shadows */
  lightShadow:
    '0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12)',

  /* border radius */
  borderRadius: '3px',
}
