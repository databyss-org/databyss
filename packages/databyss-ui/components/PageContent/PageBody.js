import React, { useEffect, useCallback, useRef, useState } from 'react'
import { debounce } from 'lodash'
import { Helmet } from 'react-helmet'
import { PDFDropZoneManager, useNavigationContext } from '@databyss-org/ui'
import { useEditorPageContext } from '@databyss-org/services'
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
  optimizePatches,
  canPatchesBeOptimized,
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

  const isDbBusy = useSessionContext((c) => c && c.isDbBusy)

  const _isDbBusy = isDbBusy()
  const { location } = useNavigationContext()
  const clearBlockDict = useEditorPageContext((c) => c.clearBlockDict)
  const setPatches = useEditorPageContext((c) => c.setPatches)

  useEffect(() => () => clearBlockDict(), [])

  const patchQueue = useRef([])
  const pageState = useRef(null)
  const editorStateRef = useRef()
  const [pendingPatches, setPendingPatches] = useState(false)

  // updates state for contentEditable `pendingPatches` property
  useEffect(() => {
    if (patchQueue.current.length === 0 && pendingPatches) {
      setPendingPatches(true)
    }
    if (patchQueue.current.length && !pendingPatches) {
      setPendingPatches(false)
    }
  }, [patchQueue.current.length])

  // if DB has no pending patches and we have patches waiting, send patches

  useEffect(() => {
    if (!_isDbBusy && pendingPatches && pageState.current) {
      const payload = {
        id: pageState.current.pageHeader._id,
        patches: optimizePatches(patchQueue.current),
      }

      setPatches(payload)
      patchQueue.current = []
    }
  }, [_isDbBusy, pendingPatches])

  const throttledAutosave = useCallback(
    debounce(
      ({ nextState, patches }) => {
        const _patches = cleanupPatches(patches)
        if (_patches.length) {
          const payload = {
            id: nextState.pageHeader._id,
            patches: optimizePatches(patchQueue.current),
          }
          setPatches(payload)
          patchQueue.current = []
        }
      },
      process.env.SAVE_PAGE_THROTTLE,
      {
        leading: true,
        maxWait: 500,
      }
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
    if (!canPatchesBeOptimized(patches) && patchQueue.current.length) {
      // if new patches cant be optimized, send current payload
      const payload = {
        id: pageState.current.pageHeader._id,
        patches: optimizePatches(patchQueue.current),
      }

      setPatches(payload)
      patchQueue.current = []
    }
    patchQueue.current = patchQueue.current.concat(patches)
    //
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
              pendingPatches={pendingPatches}
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
