import { useEffect, useState } from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { savePage } from '@databyss-org/services/pages/actions'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useEditorContext } from './EditorProvider'

const AutoSave = ({ interval }) => {
  const { dispatch: pageDispatch } = usePageContext()
  const [, , editorStateRef] = useEditorContext()
  const [navState] = useNavigationContext()

  useEffect(
    () => {
      // if modal is present, turn off autosave
      const hasModal = navState.modals.length > 0
      let _timer
      if (!hasModal && !_timer) {
        _timer = setInterval(() => {
          // TODO: check if values have changed before saving
          pageDispatch(savePage(editorStateRef.current))
        }, interval * 1000)
      }
      if (hasModal) {
        clearInterval(_timer)
        _timer = null
      }
      // on unmount clear autosave
      return () => {
        clearInterval(_timer)
      }
    },
    [navState]
  )
  return null

  // add an unmount handler
  // clear interal on unmount instead
}

AutoSave.defaultProps = {
  interval: 10,
}

export default AutoSave
