import { macros, theme as defaultTheme } from './'

export default (theme = defaultTheme) => ({
  root: {
    '& *:focus': {
      ...macros.focused(theme),
    },
  },
})
