import React, { useCallback, useEffect } from 'react'

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState
export type ModifierKey = 'Control' | 'Meta' | 'Alt' | 'Shift'

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
      const _key = evt.key.toLowerCase()
      if (
        _key === keyName.toLowerCase() &&
        modifiers.reduce((p, m) => p && evt.getModifierState(m), true)
      ) {
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
