import React, { useEffect } from 'react'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import { withMetaData } from '@databyss-org/editor/lib/util'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui'

const PageBody = ({ page }) => {
  const { location } = useNavigationContext()
  const { clearBlockDict } = usePageContext()
  useEffect(() => () => clearBlockDict(), [])
  return (
    <EditorProvider
      key={location.pathname}
      // onChange={setPageState}
      initialState={withMetaData(page)}
    >
      <ContentEditable />
    </EditorProvider>
  )
}

export default PageBody
