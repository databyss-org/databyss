import React, { useEffect } from 'react'
import EditorProvider, {
  pageReducer,
} from '@databyss-org/ui/editor/EditorProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import SlateContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'

const PageBody = ({ page, readOnly }) => {
  const { clearBlockDict } = usePageContext()
  useEffect(() => () => clearBlockDict(), [])
  return (
    <EditorProvider
      initialState={page}
      reducer={pageReducer}
      editableReducer={slateReducer}
    >
      {!readOnly && <AutoSave />}
      <EditorPage>
        <SlateContentEditable readOnly={readOnly} />
      </EditorPage>
    </EditorProvider>
  )
}

export default PageBody
