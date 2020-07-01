import React, { useEffect, useCallback, useRef } from 'react'
import { throttle } from 'lodash'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import { withMetaData, pageToEditorState } from '@databyss-org/editor/lib/util'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui'
import {
  cleanupPatches,
  addMetaToPatches,
} from '@databyss-org/editor/state/util'

const PageBody = ({ page, focusIndex }) => {
  const { location } = useNavigationContext()
  const clearBlockDict = usePageContext(c => c.clearBlockDict)
  const setPatches = usePageContext(c => c.setPatches)

  useEffect(() => () => clearBlockDict(), [])

  const patchQueue = useRef([])
  const pageState = useRef(null)

  // throttled autosave occurs every SAVE_PAGE_THROTTLE ms when changes are happening
  const throttledAutosave = useCallback(
    throttle(({ nextState, patches }) => {
      const _patches = cleanupPatches(patches)
      if (_patches.length) {
        const payload = {
          id: nextState._id,
          patches: patchQueue.current,
        }
        setPatches(payload)
        patchQueue.current = []
      }
    }, process.env.SAVE_PAGE_THROTTLE),
    []
  )

  // state from provider is out of date
  const onChange = value => {
    pageState.current = value.nextState

    const patches = addMetaToPatches(value)
    // push changes to a queue
    patchQueue.current = patchQueue.current.concat(patches)
    throttledAutosave({ ...value, patches })
  }

  return (
    <EditorProvider
      key={location.pathname}
      onChange={onChange}
      initialState={pageToEditorState(withMetaData(page))}
    >
      <ContentEditable autofocus focusIndex={focusIndex} />
    </EditorProvider>
  )
}

export default React.memo(
  PageBody,
  (prev, next) =>
    prev.page._id === next.page._id && prev.focusIndex === next.focusIndex
)
