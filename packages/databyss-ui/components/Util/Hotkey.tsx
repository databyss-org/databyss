import React, { useCallback, useEffect } from 'react'

export const Hotkey = ({
  keyName,
  onPress,
  eventType = 'keypress',
}: {
  keyName: KeyboardEvent['key']
  onPress: (event: KeyboardEvent) => void
  eventType?: 'keydown' | 'keyup' | 'keypress'
}) => {
  const handleKeydown = useCallback(
    (evt) => {
      // console.log('[Hotkey]', evt.key, key)
      if (evt.key === keyName) {
        onPress(evt)
      }
    },
    [onPress]
  )
  useEffect(() => {
    window.addEventListener(eventType, handleKeydown)
    return () => {
      window.removeEventListener(eventType, handleKeydown)
    }
  })

  return <></>
}
