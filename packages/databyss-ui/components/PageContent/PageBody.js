import React, { useEffect, useCallback } from 'react'
import { throttle } from 'lodash'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import { withMetaData } from '@databyss-org/editor/lib/util'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui'

const PageBody = ({ page }) => {
  const { location } = useNavigationContext()
  const { clearBlockDict, setPage } = usePageContext()
  useEffect(() => () => clearBlockDict(), [])

  // throttled autosave occurs every SAVE_PAGE_THROTTLE ms when changes are happening
  console.log(process.env.SAVE_PAGE_THROTTLE)
  const throttledAutosave = useCallback(
    throttle(({ state }) => {
      setPage(state)
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
