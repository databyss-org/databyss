import { pxUnits } from './views'

const breakpoints = [
  pxUnits(425),
  pxUnits(768),
  pxUnits(1024),
  pxUnits(1400),
  pxUnits(1920),
]

breakpoints.mobile = breakpoints[0]
breakpoints.tablet = breakpoints[1]
breakpoints.desktop = breakpoints[2]
breakpoints.mediumDesktop = breakpoints[3]
breakpoints.largeDesktop = breakpoints[4]

export default breakpoints
