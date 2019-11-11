import { useEffect } from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { savePage } from '@databyss-org/services/pages/actions'
import { useEditorContext } from './EditorProvider'

const AutoSave = ({ interval }) => {
  const [, pageDispatch] = usePageContext()
  const [, , editorStateRef] = useEditorContext()
  useEffect(() => {
    setInterval(
      () => pageDispatch(savePage(editorStateRef.current)),
      interval * 1000
    )
  }, [])
  return null
}

AutoSave.defaultProps = {
  interval: 10,
}

export default AutoSave
