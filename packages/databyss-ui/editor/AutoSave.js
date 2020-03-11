import { useEffect } from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useEditorContext } from './EditorProvider'

const AutoSave = ({ interval }) => {
  const { setPage } = usePageContext()
  const [, , editorStateRef] = useEditorContext()
  const { modals } = useNavigationContext()

  useEffect(
    () => {
      // if modal is present, turn off autosave
      const hasModal = modals.length > 0
      let _timer
      if (!hasModal && !_timer) {
        _timer = setInterval(() => {
          const _page = editorStateRef.current
          delete _page.page.name
          // TODO: check if values have changed before saving
          setPage(_page)
        }, interval * 1000)
      }
      if (hasModal) {
        clearInterval(_timer)
        _timer = null
      }
      // on unmount clear autosave
      return () => {
        const _page = editorStateRef.current
        delete _page.page.name
        setPage(_page)
        clearInterval(_timer)
      }
    },
    [modals]
  )
  return null
}

AutoSave.defaultProps = {
  interval: 10,
}

export default AutoSave
