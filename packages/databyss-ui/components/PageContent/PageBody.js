import React, { useEffect, useCallback } from 'react'
import _ from 'lodash'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import { withMetaData } from '@databyss-org/editor/lib/util'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui'

const PageBody = ({ page }) => {
  const { location } = useNavigationContext()
  const { clearBlockDict, setPage } = usePageContext()
  useEffect(() => () => clearBlockDict(), [])

  // debounced autosave occurs 3 seconds after editor is idle
  const debouncedAutosave = useCallback(
    _.debounce(pageState => {
      setPage(pageState)
    }, 3000),
    []
  )

  return (
    <EditorProvider
      key={location.pathname}
      onChange={debouncedAutosave}
      initialState={withMetaData(page)}
    >
      <ContentEditable />
    </EditorProvider>
  )
}

export default PageBody
