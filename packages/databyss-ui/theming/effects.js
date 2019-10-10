import { Platform } from 'react-native'
import Color from 'color'
import { pxUnits } from './views'

export const shadow = (offsetLeft, offsetTop, blur, color, opacity) => {
  const native = {
    shadowOffset: { width: offsetLeft, height: offsetTop },
    shadowRadius: blur,
    shadowColor: color,
    shadowOpacity: opacity,
  }
  const web = {
    boxShadow: `${offsetLeft}px ${offsetTop}px ${blur}px ${Color(color)
      .alpha(opacity)
      .rgb()
      .string()}`,
  }
  return Platform.select({
    ios: native,
    android: native,
    default: web,
  })
}

const effects = {
  buttonShadow: {
    ...shadow(0, 1, 1, 'black', 0.25),
    marginBottom: pxUnits(1),
  },
}

export default effects
