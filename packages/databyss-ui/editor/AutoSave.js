import { useEffect, useState } from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { savePage } from '@databyss-org/services/pages/actions'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useEditorContext } from './EditorProvider'

const AutoSave = ({ interval }) => {
  const { dispatch: pageDispatch } = usePageContext()
  const [, , editorStateRef] = useEditorContext()
  const [navState] = useNavigationContext()

  const [refreshId, setRefreshId] = useState(null)

  useEffect(
    () => {
      // if modal is present, turn off autosave
      const hasModal = navState.modals.length > 0
      if (!refreshId && !hasModal) {
        setRefreshId(
          setInterval(() => {
            // TODO: check if values have changed before saving
            pageDispatch(savePage(editorStateRef.current))
          }, interval * 1000)
        )
      }
      if (hasModal) {
        clearInterval(refreshId)
        setRefreshId(null)
      }
    },
    [navState]
  )
  return null
}

AutoSave.defaultProps = {
  interval: 10,
}

export default AutoSave
