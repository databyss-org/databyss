import colors from './colors'
import effects from './effects'
import responsive from './responsive'
import space from './space'
import views, { borderRadius, pxUnits } from './views'
import fonts from './fonts'
import timing from './timing'
import buttons from './buttons'
import icons from './icons'
import zIndex from './zindex'

const theme = {
  name: 'defaultTheme',
  /* space */
  space,

  /* fonts */
  ...fonts,

  /* buttons */
  ...buttons,

  /* colors */
  colors,

  /* colors */
  ...effects,

  /* responsive */
  ...responsive,
  breakpoints: responsive,

  /* views */
  ...views,

  /* timing */
  timing,

  /* icons */
  ...icons,

  /* zIndex */
  zIndex,
}

export default theme

export { borderRadius, pxUnits, timing }

export const darkTheme = {
  ...theme,
  name: 'darkTheme',
  colors: {
    ...theme.colors,
    ...theme.colors.modes.dark,
  },
}

export const lightTheme = {
  ...theme,
  name: 'lightTheme',
  colors: {
    ...theme.colors,
    ...theme.colors.modes.light,
  },
}

export const darkContentTheme = {
  ...theme,
  name: 'darkContentTheme',
  colors: {
    ...theme.colors,
    ...theme.colors.modes.darkContent,
  },
}

export const lightContentTheme = {
  ...theme,
  name: 'lightContentTheme',
  colors: {
    ...theme.colors,
    ...theme.colors.modes.lightContent,
  },
}
