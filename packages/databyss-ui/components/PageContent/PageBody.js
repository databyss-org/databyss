import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { DropZoneManager, Text, View } from '@databyss-org/ui'
import { useEditorPageContext } from '@databyss-org/services'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { withMetaData } from '@databyss-org/editor/lib/util'
import CatalogProvider from '@databyss-org/services/catalog/CatalogProvider'
import ContentEditable from '@databyss-org/editor/components/ContentEditable'
import EditorProvider from '@databyss-org/editor/state/EditorProvider'
import HistoryProvider from '@databyss-org/editor/history/EditorHistory'
import {
  normalizePage,
  didBlocksChange,
} from '@databyss-org/data/pouchdb/pages/util'
import { upsert } from '@databyss-org/data/pouchdb/utils'
import { DocumentType } from '@databyss-org/data/pouchdb/interfaces'
import {
  addMetaToPatches,
  pageToEditorState,
} from '@databyss-org/editor/state/util'
import { UNTITLED_PAGE_NAME } from '@databyss-org/services/interfaces'
import _, { debounce } from 'lodash'

export const PageBody = ({
  page,
  focusIndex,
  onNavigateUpFromEditor,
  editorRef: editableRef,
  onEditorPathChange,
}) => {
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)
  const setPageHeader = useEditorPageContext((c) => c.setPageHeader)
  const sharedWithGroups = useEditorPageContext((c) => c.sharedWithGroups)
  const setPatches = useEditorPageContext((c) => c.setPatches)
  const pageState = useRef(null)
  const editorStateRef = useRef()

  const debouncedSetPageHeader = _.debounce(setPageHeader, 1000)

  const [_debugSlateState, _setDebugSlateState] = useState(null)

  // state from provider is out of date
  const onChange = (value) => {
    requestAnimationFrame(() => {
      if (editorStateRef.current?.pagePath) {
        onEditorPathChange(editorStateRef.current.pagePath)
      }
    })

    // handle changes to page title block
    if (value?.patches?.length) {
      const _patch = value.patches.find(
        (_patch) => _patch.path?.[0] === 'blocks' && _patch.path?.[1] === 0
      )
      const _patchValue =
        _patch?.path?.[2] === 'text'
          ? _patch?.value?.textValue
          : _patch?.value?.text?.textValue
      if (_patchValue !== null && _patchValue !== undefined) {
        const _pageData = {
          name: _patchValue.trim() || UNTITLED_PAGE_NAME,
          _id: page._id,
        }
        debouncedSetPageHeader(_pageData)
      }
    }

    pageState.current = value.nextState

    const _patches = addMetaToPatches(value)

    const payload = {
      id: value.nextState.pageHeader._id,
      patches: _patches,
    }
    setPatches(payload)

    // blocks array in page might have changed, upsert page blocks
    const _nextBlocks = normalizePage(value.nextState).blocks
    const _prevBlocks = normalizePage(value.previousState).blocks

    if (
      _nextBlocks.length !== _prevBlocks.length ||
      didBlocksChange({
        blocksBefore: _prevBlocks,
        blocksAfter: _nextBlocks,
      })
    ) {
      const { _id } = value.nextState.pageHeader
      const _page = { blocks: _nextBlocks, _id }
      upsert({ doctype: DocumentType.Page, _id: _page._id, doc: _page })
    }
  }

  /**
   * Only test env: put the Slate hyperscript doc in state to render for tests
   */
  const onDocumentChange = useCallback(
    debounce(
      (val) => {
        const _valJson = JSON.stringify(val, null, 2)
        _setDebugSlateState(_valJson)
      },
      100,
      { trailing: true }
    )
  )

  const readOnly = isReadOnly || page.archive

  return (
    <CatalogProvider>
      {readOnly && (
        <Helmet>
          <meta charSet="utf-8" />
          <title>{page.name}</title>
        </Helmet>
      )}
      <HistoryProvider ref={editorStateRef}>
        {useMemo(
          () => (
            <EditorProvider
              key={page._id}
              // if read only, disable on change
              onChange={(v) => !readOnly && onChange(v)}
              initialState={{
                ...pageToEditorState(withMetaData(page)),
                firstBlockIsTitle: true,
              }}
            >
              <DropZoneManager />
              <ContentEditable
                autofocus
                focusIndex={focusIndex}
                onNavigateUpFromTop={onNavigateUpFromEditor}
                active={false}
                editableRef={editableRef}
                readonly={readOnly}
                sharedWithGroups={sharedWithGroups}
                firstBlockIsTitle
                {...(process.env.NODE_ENV === 'test'
                  ? { onDocumentChange }
                  : {})}
              />
            </EditorProvider>
          ),
          [page?._id, focusIndex, readOnly, sharedWithGroups]
        )}
      </HistoryProvider>
      {process.env.NODE_ENV === 'test' && (
        <View height="120px" overflow="scroll" bg="black" p="medium">
          <Text
            color="white"
            variant="uiTextSmall"
            id="slateDocument"
            css={{
              whiteSpace: 'pre-wrap',
            }}
          >
            {_debugSlateState}
          </Text>
        </View>
      )}
    </CatalogProvider>
  )
}
