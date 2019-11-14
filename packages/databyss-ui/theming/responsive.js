import { pxUnits } from './views'

const breakpoints = [600, 1024, 1200, 1400].map(pxUnits)

breakpoints.mobile = breakpoints[0]
breakpoints.desktop = breakpoints[1]

export default { breakpoints }
