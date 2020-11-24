import React, { useEffect } from 'react'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { version } from '../../../../package.json'

export const NotifyMessage = () => {
  const { notify } = useNotifyContext()

  useEffect(() => {
    const _shown = localStorage.getItem(`releasenotes_${version}`)
    if (!_shown) {
      const _msg = require(`../../../../.releasenotes/notify_${version}.json`)
      localStorage.setItem(`releasenotes_${version}`, true)
      notify(_msg.message)
    }
  }, [])
  return null
}
