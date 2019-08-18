import colors from './colors'
import responsive from './responsive'
import space from './space'
import sizes from './sizes'
import views from './views'
import fonts from './fonts'
import timing from './timing'

export default {
  /* space */
  space,

  /* sizes */
  sizes,

  /* fonts */
  ...fonts,

  /* colors */
  colors,

  /* responsive */
  responsive,

  /* views */
  ...views,

  /* timing */
  timing,

  /* shadows */
  lightShadow:
    '0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.12)',

  /* border radius */
  borderRadius: '3px',

  zIndex: {
    modalOverlay: 200,
  },
}
