import { macros, theme as defaultTheme } from '../../shared-styles'

export default (theme = defaultTheme) => ({
  root: {
    '& *:focus': {
      ...macros.focused(theme),
    },
  },
})
