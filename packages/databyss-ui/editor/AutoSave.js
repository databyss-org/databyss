import { useEffect } from 'react'
import cloneDeep from 'clone-deep'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useEditorContext } from './EditorProvider'

const AutoSave = ({ interval }) => {
  const { setPage, getPage } = usePageContext()
  const [, , editorStateRef] = useEditorContext()
  const { modals } = useNavigationContext()

  useEffect(
    () => {
      // if modal is present, turn off autosave
      const hasModal = modals.length > 0
      let _timer
      if (!hasModal && !_timer) {
        _timer = setInterval(() => {
          const _page = cloneDeep(editorStateRef.current)
          delete _page.page.name
          // preserve name from page cache
          const _name = getPage(_page.page._id).page.name
          _page.page.name = _name
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
        const _page = cloneDeep(editorStateRef.current)
        delete _page.page.name
        const _pageState = getPage(_page.page._id)
        if (_pageState) {
          const _name = _pageState.page.name
          _page.page.name = _name
          setPage(_page)
        }

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
