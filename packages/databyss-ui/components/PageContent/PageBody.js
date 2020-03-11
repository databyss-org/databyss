import React from 'react'

import EditorProvider, {
  pageReducer,
} from '@databyss-org/ui/editor/EditorProvider'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import SlateContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'

const PageBody = ({ page, readOnly }) => (
  <EditorProvider
    initialState={page}
    reducer={pageReducer}
    editableReducer={slateReducer}
  >
    {!readOnly && <AutoSave />}
    <EditorPage autoFocus>
      <SlateContentEditable readOnly={readOnly} />
    </EditorPage>
  </EditorProvider>
)

export default PageBody
