import colors from './colors'
import effects from './effects'
import responsive from './responsive'
import space from './space'
import views, { borderRadius, pxUnits } from './views'
import fonts from './fonts'
import timing from './timing'
import buttons from './buttons'
import icons from './icons'

const theme = {
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

  /* views */
  ...views,

  /* timing */
  timing,

  /* icons */
  ...icons,

  /* shadows (deprecated, use `effects`) */
  lightShadow:
    '0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12)',

  zIndex: {
    modalOverlay: 200,
  },
}

export default theme

export { borderRadius, pxUnits, timing }

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    ...theme.colors.modes.dark,
  },
}
