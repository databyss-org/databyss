const mobileOsAgents = /ios|ipad|iphone|android|windows phone/i

const _isMobile = window.innerWidth <= 600
const _isMobileOs = navigator.userAgent.match(mobileOsAgents)

export const isMobile = () => _isMobile || process.env.FORCE_MOBILE
export const isMobileOs = () => _isMobileOs || process.env.FORCE_MOBILE
export const isMobileOrMobileOs = () => isMobile() || isMobileOs()
