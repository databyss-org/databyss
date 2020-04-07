import React, { useEffect, useState, useRef } from 'react'
import { View } from '@databyss-org/ui/primitives'

const AutoSave = ({ children, interval, onSave }) => {
  const timeoutRef = useRef()

  const [time, setTime] = useState(Date.now())

  /* on unmount save and cancel timeout */
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        onSave()
        clearTimeout(timeoutRef.current)
      }
    },
    []
  )

  const onEvent = e => {
    // e.preventDefault()
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // triggers save event on leading edge of keystrokes
    if (time + interval * 1000 - Date.now() < 0) {
      clearTimeout(timeoutRef.current)
      setTimeout(() => onSave(), 500)
      setTime(Date.now())
    }

    // triggers save event on trailing edge of keystrokes
    timeoutRef.current = setTimeout(() => {
      onSave()
    }, interval * 500)
  }

  return (
    <View
      onKeyUp={() => window.requestAnimationFrame(() => onEvent())}
      onClick={() => window.requestAnimationFrame(() => onEvent())}
    >
      {React.cloneElement(children)}
    </View>
  )
}

AutoSave.defaultProps = {
  interval: 1,
}

export default AutoSave
