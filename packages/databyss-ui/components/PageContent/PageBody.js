import React, { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { PDFDropZoneManager, useNavigationContext } from '@databyss-org/ui'
import { useEditorPageContext } from '@databyss-org/services'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { withMetaData } from '@databyss-org/editor/lib/util'
import CatalogProvider from '@databyss-org/services/catalog/CatalogProvider'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import HistoryProvider from '@databyss-org/editor/history/EditorHistory'
import { normalizePage } from '@databyss-org/data/pouchdb/pages/util'
import { upsert } from '@databyss-org/data/pouchdb/utils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import {
  addMetaToPatches,
  pageToEditorState,
} from '@databyss-org/editor/state/util'

import { isMobile } from '../../lib/mediaQuery'

const PageBody = ({
  page,
  focusIndex,
  onNavigateUpFromEditor,
  editorRef,
  onEditorPathChange,
}) => {
  const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

  const { location } = useNavigationContext()
  const clearBlockDict = useEditorPageContext((c) => c.clearBlockDict)
  const setPatches = useEditorPageContext((c) => c.setPatches)

  useEffect(() => () => clearBlockDict(), [])

  const pageState = useRef(null)
  const editorStateRef = useRef()

  // state from provider is out of date
  const onChange = (value) => {
    requestAnimationFrame(() => {
      if (editorStateRef.current?.pagePath) {
        onEditorPathChange(editorStateRef.current.pagePath)
      }
    })

    pageState.current = value.nextState

    const _patches = addMetaToPatches(value)

    const payload = {
      id: value.nextState.pageHeader._id,
      patches: _patches,
    }
    setPatches(payload)

    // blocks array in page might have changed, upsert page blocks
    const _nextBlocks = normalizePage(value.nextState).blocks
    const { _id } = value.nextState.pageHeader
    const _page = { blocks: _nextBlocks, _id }
    upsert({ doctype: DocumentType.Page, _id: _page._id, doc: _page })
  }

  const render = () => {
    const isReadOnly = isPublicAccount() || isMobile() || page.archive

    return (
      <CatalogProvider>
        {isReadOnly && (
          <Helmet>
            <meta charSet="utf-8" />
            <title>{page.name}</title>
          </Helmet>
        )}
        <HistoryProvider ref={editorStateRef}>
          <EditorProvider
            key={location.pathname}
            // if read only, disable on change
            onChange={(v) => !isReadOnly && onChange(v)}
            initialState={pageToEditorState(withMetaData(page))}
          >
            <PDFDropZoneManager />
            <ContentEditable
              autofocus
              focusIndex={focusIndex}
              onNavigateUpFromTop={onNavigateUpFromEditor}
              active={false}
              editorRef={editorRef}
              readonly={isReadOnly}
            />
          </EditorProvider>
        </HistoryProvider>
      </CatalogProvider>
    )
  }

  return render()
}

export default React.memo(
  PageBody,
  (prev, next) =>
    prev.page._id === next.page._id && prev.focusIndex === next.focusIndex
)
