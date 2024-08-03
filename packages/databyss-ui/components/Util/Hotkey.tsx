import React, { useCallback, useEffect } from 'react'

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState
export type ModifierKey = 'Ctrl' | 'Meta' | 'Alt' | 'Shift'

export const Hotkey = ({
  keyName,
  onPress,
  eventType = 'keydown',
  modifiers = [],
}: {
  keyName: KeyboardEvent['key']
  onPress: (event: KeyboardEvent) => void
  eventType?: 'keydown' | 'keyup' | 'keypress'
  modifiers?: ModifierKey[]
}) => {
  const handleKeydown = useCallback(
    (evt: KeyboardEvent) => {
      if (
        evt.key === keyName &&
        modifiers.reduce((p, m) => p && evt.getModifierState(m), true)
      ) {
        console.log('[Hotkey]', evt.key, modifiers)
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
