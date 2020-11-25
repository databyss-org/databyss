import { useEffect } from 'react'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { version } from '@databyss-org/ui/package.json'

const NotifyMessage = () => {
  const { notifyHtml } = useNotifyContext()

  useEffect(() => {
    const _shown = localStorage.getItem(`releasenotes_${version}`)
    const _msg = JSON.parse(process.env.RELEASE_NOTES)[version]
    if (!_shown && _msg) {
      localStorage.setItem(`releasenotes_${version}`, true)
      notifyHtml(_msg)
    }
  }, [])
  return null
}

export default NotifyMessage