import defaultTheme from './theme'
import { isMobileOs } from '../lib/mediaQuery'

const nestedQuery = (query, styles, theme) => {
  const hoisted = {}
  const wrapped = {
    [query]: Object.keys(styles).reduce((styleObj, styleKey) => {
      if (styleKey.charAt(0) === '&') {
        hoisted[styleKey] = nestedQuery(query, styles[styleKey], theme)
        return styleObj
      }
      styleObj[styleKey] = styles[styleKey]
      return styleObj
    }, {}),
  }
  return {
    ...wrapped,
    ...hoisted,
  }
}

export const asNumber = numberLike => parseInt(numberLike, 10)

export const mobileOs = styles => (isMobileOs() ? styles : {})

export const notMobileOs = styles => (!isMobileOs() ? styles : {})

export const mobile = (styles, theme = defaultTheme) =>
  nestedQuery(`@media (max-width: ${theme.mobileWidth})`, styles, theme)

export const mobileOrMobileOs = (styles, theme = defaultTheme) => ({
  ...mobile(styles, theme),
  ...mobileOs(styles),
})

export const tablet = (styles, theme = defaultTheme) =>
  nestedQuery(
    `@media (min-width: ${asNumber(theme.mobileWidth) + 1}px)`,
    styles,
    theme
  )

export const tabletOnly = (styles, theme = defaultTheme) =>
  nestedQuery(
    `@media (min-width: ${asNumber(theme.mobileWidth) + 1}px) and (max-width: ${
      theme.desktopWidth
    })`,
    styles,
    theme
  )

export const tabletNotMobileOs = (styles, theme = defaultTheme) =>
  notMobileOs(tablet(styles, theme))

export const desktop = (styles, theme = defaultTheme) =>
  nestedQuery(
    `@media (min-width: ${asNumber(theme.tabletWidth) + 1}px)`,
    styles,
    theme
  )

export const centerBoth = () => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
})

export const commas = () => ({
  '&:after': {
    content: '","',
    paddingRight: '0.4em',
  },
  '&:last-child:after': {
    content: '""',
    paddingRight: 0,
  },
})

export const focused = theme => ({
  outline: `${theme.focusOutlineColor} auto 5px`,
})
