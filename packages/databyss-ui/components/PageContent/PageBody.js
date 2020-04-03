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
    console.log('emit autosave')
    const _page = cloneDeep(editorStateRef.current)
    delete _page.page.name
    // preserve name from page cache
    const _name = getPage(_page.page._id).page.name
    _page.page.name = _name
    setPage(_page)
  }

  return (
    <AutoSave onSave={onSave}>
      <EditorPage>
        <SlateContentEditable
        // readOnly={readOnly}
        // onBlur={() => {
        //   console.log('BLURRED')
        //   readOnly = true
        // }}
        // onFocus={() => {
        //   console.log('IN FOCUS')
        //   readOnly = false
        // }}
        // onBlur={() => setReadOnly(true)}
        // onFocus={() => setReadOnly(false)}
        />
      </EditorPage>
    </AutoSave>
  )
}

const PageBody = ({ page }) => {
  const [keyEvent, setKeyEvent] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  // const readOnly = useRef()

  const { clearBlockDict } = usePageContext()

  /* on unmount */
  useEffect(() => () => clearBlockDict(), [])

  const onKeyPress = () => {
    setKeyEvent(true)
  }

  const keySaveEvent = () => {
    setKeyEvent(false)
  }

  // console.log(readOnly)

  // useEffect(
  //   () => {
  //     console.log('IN EFFECT')
  //     //   console.log(readOnly.current)
  //   },
  //   [readOnly]
  // )

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
