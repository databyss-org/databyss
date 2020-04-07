import React, { useEffect, useState, useRef } from 'react'
import cloneDeep from 'clone-deep'
import EditorProvider, {
  pageReducer,
  useEditorContext,
} from '@databyss-org/ui/editor/EditorProvider'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { Text, View, TextControl } from '@databyss-org/ui/primitives'
import AutoSave from '@databyss-org/ui/editor/AutoSave'
import EditorPage from '@databyss-org/ui/editor/EditorPage'
import SlateContentEditable from '@databyss-org/ui/editor/slate/page/ContentEditable'
import slateReducer from '@databyss-org/ui/editor/slate/page/reducer'

const PageWithAutosave = () => {
  const { setPage, getPage } = usePageContext()
  const [, , editorStateRef] = useEditorContext()

  const onSave = () => {
    const _page = cloneDeep(editorStateRef.current)
    // delete _page.page.name

    setPage(_page)
  }

  return (
    <AutoSave onSave={onSave}>
      <EditorPage>
        <SlateContentEditable />
      </EditorPage>
    </AutoSave>
  )
}

const PageBody = ({ page }) => {
  const { clearBlockDict } = usePageContext()

  /* on unmount clear entry refs dictionary */
  useEffect(() => () => clearBlockDict(), [])

  return (
    <EditorProvider
      initialState={page}
      reducer={pageReducer}
      editableReducer={slateReducer}
    >
      <PageWithAutosave />
    </EditorProvider>
  )
}

export default PageBody
