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

  const onEvent = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // triggers save event on leading edge of keystrokes
    if (time + interval * 1000 - Date.now() < 0) {
      //    window.requestAnimationFrame(() => onSave())
      setTimeout(() => onSave(), 500)
      setTime(Date.now())
      clearTimeout(timeoutRef.current)
    }

    // triggers save event on trailing edge of keystrokes
    timeoutRef.current = setTimeout(() => {
      onSave()
    }, interval * 500)
  }

  return (
    <View onKeyUp={onEvent} onClick={onEvent}>
      {React.cloneElement(children)}
    </View>
  )
}

AutoSave.defaultProps = {
  interval: 1,
}

export default AutoSave
