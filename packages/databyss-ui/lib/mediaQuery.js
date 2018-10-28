const mobileOsAgents = /ios|ipad|iphone|android|windows phone/i

export const isMobile = () => window.innerWidth <= 600
export const isMobileOs = () => navigator.userAgent.match(mobileOsAgents)
export const isMobileOrMobileOs = () => isMobile() || isMobileOs()
