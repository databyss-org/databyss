import { Platform } from 'react-native'

export const pxUnits = Platform.select({
  ios: v => v,
  android: v => v,
  default: v => `${v}px`,
})

const sizes = {
  contentWidth: pxUnits(500),
  mobileWidth: pxUnits(600),
  desktopWidth: pxUnits(1024),
  maxPageWidth: pxUnits(1024),
}

export default sizes
