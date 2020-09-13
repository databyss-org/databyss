import { macros, theme as defaultTheme } from './'

export default (theme = defaultTheme, mergeStyles = {}) => ({
  root: {
    '& *:focus': {
      ...macros.focused(theme),
    },
    ...mergeStyles(theme),
  },
})
