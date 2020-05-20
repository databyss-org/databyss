import React, { useEffect, useCallback } from 'react'
import { throttle } from 'lodash'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import { withMetaData } from '@databyss-org/editor/lib/util'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui'
import { withWhitelist } from '@databyss-org/services/pages/_helpers'

const PageBody = ({ page }) => {
  const { location } = useNavigationContext()
  const { clearBlockDict, setPage, setPatch } = usePageContext()
  useEffect(() => () => clearBlockDict(), [])

  // throttled autosave occurs every SAVE_PAGE_THROTTLE ms when changes are happening
  const throttledAutosave = useCallback(
    throttle(({ state, patch }) => {
      const _patch = withWhitelist(patch)
      if (_patch.length) {
        const payload = {
          id: state.page._id,
          patch: _patch,
        }
        setPatch(payload)
        // setPage(state)
      }
    }, process.env.SAVE_PAGE_THROTTLE),
    []
  )

  return (
    <EditorProvider
      key={location.pathname}
      onChange={throttledAutosave}
      initialState={withMetaData(page)}
    >
      <ContentEditable />
    </EditorProvider>
  )
}

export default PageBody
