import { theme as defaultTheme } from './'

export default (theme = defaultTheme, mergeStyles) => ({
  root: mergeStyles ? mergeStyles(theme) : {},
})
