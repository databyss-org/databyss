import React, { useEffect, useState, useRef } from 'react'
import cloneDeep from 'clone-deep'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useEditorContext } from './EditorProvider'
import { Text, View, TextControl } from '@databyss-org/ui/primitives'

const AutoSave = ({ children, interval, onSave }) => {
  const [active, setActive] = useState(true)
  const { setPage, getPage } = usePageContext()
  const [, , editorStateRef] = useEditorContext()
  const timeoutRef = useRef()

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

  /* */
  useEffect(
    () => {
      if (!active && timeoutRef.current) {
        onSave()
        clearTimeout(timeoutRef.current)
        console.log('disabled')
      }
    },
    [active]
  )

  /* debounce key press events */
  // useEffect(
  //   () => {
  //     if (keyEvent && active) {
  //       onSaveEvent()
  //       onKeyEvent()
  //     }
  //   },
  //   [keyEvent]
  // )

  const onKeyEvent = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      onSave()
    }, interval * 1000)
  }

  /* dispatch save event */
  // const onSave = () => {
  //   if (saveFunction) {
  //     saveFunction()
  //   }
  //   console.log('emit save')
  //   const _page = cloneDeep(editorStateRef.current)
  //   delete _page.page.name
  //   // preserve name from page cache
  //   const _name = getPage(_page.page._id).page.name
  //   _page.page.name = _name
  //     setPage(_page)
  // }

  const onBlur = () => {
    setActive(false)
  }

  return (
    <View
      onBlur={onBlur}
      onClick={() => setActive(true)}
      onKeyPress={onKeyEvent}
    >
      {React.cloneElement(children, {
        readOnly: !active,
        /*more listeners*/
      })}
    </View>
  )
}

AutoSave.defaultProps = {
  interval: 3,
}

export default AutoSave
