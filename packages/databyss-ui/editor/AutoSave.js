import { useEffect, useState } from 'react'
import _ from 'lodash'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { savePage } from '@databyss-org/services/pages/actions'
import { useEditorContext } from './EditorProvider'

const removeProperties = state => {
  const { page, blocks, topics, entries, sources, locations } = state
  const _state = {
    page,
    blocks,
    topics,
    entries,
    sources,
    locations,
  }
  return _state
}
const AutoSave = ({ interval }) => {
  const [, pageDispatch] = usePageContext()
  const [, , editorStateRef] = useEditorContext()
  const [lastState, setLastState] = useState(editorStateRef.current)
  useEffect(() => {
    setInterval(() => {
      // check if values have changed before saving
      const _current = removeProperties(editorStateRef.current)
      if (!_.isEqual(_current, lastState)) {
        setLastState(_current)
        pageDispatch(savePage(editorStateRef.current))
      }
    }, interval * 1000)
  }, [])
  return null
}

AutoSave.defaultProps = {
  interval: 10,
}

export default AutoSave
