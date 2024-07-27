import { StateData, appState } from './appState'

type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'unknown'

function getPlatform(): Platform {
  const userAgent = window.navigator.userAgent
  console.log('userAgent', userAgent)
  const platform =
    window.navigator?.userAgentData?.platform ||
    window.navigator.platform ||
    userAgent
  const macosPlatforms = [
    'macOS',
    'darwin',
    'Mac OS',
    'Macintosh',
    'MacIntel',
    'MacPPC',
    'Mac68K',
  ]
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
  const iosPlatforms = ['iPhone', 'iPad', 'iPod']

  if (macosPlatforms.indexOf(platform) !== -1) {
    return 'macos'
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    return 'ios'
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    return 'windows'
  } else if (/Android/.test(userAgent)) {
    return 'android'
  } else if (/Linux/.test(platform)) {
    return 'linux'
  }

  return 'unknown'
}

const stateApi = {
  get: <K extends keyof StateData>(key: K) =>
    new Promise((resolve) => resolve(appState.get(key))),
  set: <K extends keyof StateData>(key: K, value: StateData[K]) =>
    appState.set(key, value),
}
const _win: any = window
_win.eapi = {
  isDesktop: false,
  isWeb: true,
  state: stateApi,
  platform: getPlatform(),
}
