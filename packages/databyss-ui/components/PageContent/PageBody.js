import React, { useEffect } from 'react'
// import EditorProvider, {
//   pageReducer,
// } from '@databyss-org/ui/editor/EditorProvider'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import { withMetaData } from '@databyss-org/editor/lib/util'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useNavigationContext } from '@databyss-org/ui'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import SlateContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'

const PageBody = ({ page, readOnly }) => {
  console.log(page)
  const { location } = useNavigationContext()
  const { clearBlockDict } = usePageContext()
  useEffect(() => () => clearBlockDict(), [])
  return (
    <EditorProvider
      // onChange={setPageState}
      initialState={withMetaData(page)}
    >
      <ContentEditable />
    </EditorProvider>
  )
}

export default PageBody
