import IS_NATIVE from './isNative'

const mobileOsAgents = /ios|ipad|iphone|android|windows phone/i

export const isMobile = () => IS_NATIVE || window.innerWidth <= 600
export const isMobileOs = () =>
  IS_NATIVE || navigator.userAgent.match(mobileOsAgents)
export const isMobileOrMobileOs = () => isMobile() || isMobileOs()
