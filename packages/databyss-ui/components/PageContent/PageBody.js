import React, { useEffect, useCallback, useRef } from 'react'
import { debounce } from 'lodash'
import { Helmet } from 'react-helmet'
import { PDFDropZoneManager, useNavigationContext } from '@databyss-org/ui'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { withMetaData } from '@databyss-org/editor/lib/util'
import CatalogProvider from '@databyss-org/services/catalog/CatalogProvider'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import HistoryProvider from '@databyss-org/editor/history/EditorHistory'
import {
  addMetaToPatches,
  cleanupPatches,
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
  const clearBlockDict = usePageContext((c) => c.clearBlockDict)
  const setPatches = usePageContext((c) => c.setPatches)

  useEffect(() => () => clearBlockDict(), [])

  const patchQueue = useRef([])
  const pageState = useRef(null)
  const editorStateRef = useRef()

  const throttledAutosave = useCallback(
    debounce(
      ({ nextState, patches }) => {
        const _patches = cleanupPatches(patches)
        if (_patches.length) {
          const payload = {
            id: nextState.pageHeader._id,
            patches: patchQueue.current,
          }
          setPatches(payload)
          patchQueue.current = []
        }
      },
      process.env.SAVE_PAGE_THROTTLE,
      { leading: true, maxWait: 500 }
    ),
    []
  )

  // state from provider is out of date
  const onChange = (value) => {
    requestAnimationFrame(() => {
      if (editorStateRef.current?.pagePath) {
        onEditorPathChange(editorStateRef.current.pagePath)
      }
    })

    pageState.current = value.nextState

    const patches = addMetaToPatches(value)
    // push changes to a queue
    patchQueue.current = patchQueue.current.concat(patches)
    throttledAutosave({ ...value, patches })
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
