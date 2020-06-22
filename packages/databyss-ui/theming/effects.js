import { Platform } from 'react-native'
import Color from 'color'

export const shadow = (offsetLeft, offsetTop, blur, color, opacity) => {
  const native = {
    shadowOffset: { width: offsetLeft, height: offsetTop },
    shadowRadius: blur,
    shadowColor: color,
    shadowOpacity: opacity,
    backgroundColor: 'inherit',
  }
  const web = {
    boxShadow: `${offsetLeft}px ${offsetTop + 0.2}px ${blur * 2}px ${Color(
      color
    )
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

const shadowColor = 'black'

/* shadows by elevation */
/* https://ethercreative.github.io/react-native-shadow-generator/ */
const shadows = [
  {}, // elevation 0, no shadow,
  shadow(0, 1, 1, shadowColor, 0.18),
  shadow(0, 3, 3, shadowColor, 0.2),
]

const effects = {
  buttonShadow: {
    ...shadows[1],
    backgroundColor: 'background.0',
  },
  modalShadow: {
    ...shadows[2],
    backgroundColor: 'background.0',
  },
}

const shadowVariants = {
  none: {},
  button: effects.buttonShadow,
  modal: effects.modalShadow,
}

export default {
  ...effects,
  shadowVariants,
}
