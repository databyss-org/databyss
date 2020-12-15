import { useEffect } from 'react'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'

const FIREFOX_WARNING =
  'Databyss was built to run best on Chromium- and WebKit-based browsers (such as Chrome, Safari, Edge, Brave, Iron). At this time, we cannot guarantee the best experience on Firefox.'

const IS_FIREFOX = navigator.userAgent.search('Firefox')

const FirefoxWarning = () => {
  const { notify } = useNotifyContext()

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      // never show release notes dialog in TEST env
      return
    }
    if (!IS_FIREFOX) {
      return
    }
    const _shown = localStorage.getItem(`ffwarning`)
    if (!_shown) {
      localStorage.setItem(`ffwarning`, true)
      notify(FIREFOX_WARNING)
    }
  }, [])
  return null
}

export default FirefoxWarning
