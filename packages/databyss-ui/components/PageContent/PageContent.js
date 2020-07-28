import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, Router } from '@reach/router'
import { PagesLoader, PageLoader } from '@databyss-org/ui/components/Loaders'
import { useNotifyContext } from '@databyss-org/ui/components/Notify/NotifyProvider'
import { View, Text } from '@databyss-org/ui/primitives'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { ArchiveBin } from './ArchiveBin'

import PageHeader from './PageHeader'
import PageBody from './PageBody'
import PageSticky from './PageSticky'

export const PageRouter = () => (
  <Router>
    <PageContent path=":id" />
  </Router>
)

const PageContainer = React.memo(({ anchor, id, page }) => {
  const getBlockRefByIndex = usePageContext(c => c.getBlockRefByIndex)
  const hasPendingPatches = usePageContext(c => c.hasPendingPatches)

  const { isOnline } = useNotifyContext()

  const [pendingPatches, setPendingPatches] = useState(0)
  const [editorState, setEditorState] = useState(null)
  const headerRef = useRef()
  const editorRef = useRef()

  // index is used to set selection in slate
  const [index, setIndex] = useState(null)

  useEffect(
    () => {
      setPendingPatches(hasPendingPatches)
    },
    [hasPendingPatches]
  )

  useEffect(() => {
    // if anchor link exists, scroll to anchor
    if (anchor) {
      // get index value of anchor on page
      const _index = page.blocks.findIndex(b => b._id === anchor)
      if (_index > -1) {
        setIndex(_index)
        const _ref = getBlockRefByIndex(_index)
        if (_ref) {
          window.requestAnimationFrame(() => {
            _ref.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          })
        }
      }
    }
  }, [])

  // focus header
  const onNavigateUpFromEditor = () => {
    if (headerRef.current) {
      headerRef.current.focus()
    }
  }

  // focus editor
  const onNavigateDownToEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const onEditorChange = editorStateRef => {
    setEditorState(editorStateRef?.state)
  }

  return (
    <View height="100vh" overflow="scroll" p="medium">
      <PageSticky page={editorState} />
      <View
        mr="medium"
        alignItems="center"
        flexDirection="row"
        justifyContent="space-between"
      >
        <PageHeader
          ref={headerRef}
          pageId={id}
          onNavigateDownFromHeader={onNavigateDownToEditor}
        />
        <Text color="gray.5" pr="medium" variant="uiTextSmall">
          {isOnline && (pendingPatches ? 'Saving...' : 'All changes saved')}
          {!isOnline && 'Offline'}
        </Text>
        <PagesLoader>{pages => <ArchiveBin pages={pages} />}</PagesLoader>
      </View>
      <PageBody
        onEditorChange={onEditorChange}
        editorRef={editorRef}
        page={page}
        focusIndex={index}
        onNavigateUpFromEditor={onNavigateUpFromEditor}
      />
    </View>
  )
}, (prev, next) => prev.page._id === next.page._id && prev.id === next.id && prev.anchor === next.anchor)

const PageContent = () => {
  // get page id and anchor from url
  const { id } = useParams()
  const anchor = useLocation().hash.substring(1)

  /*
  use same route to update name, just pass it name 
  */

  return (
    <View flex="1" height="100vh">
      {id && (
        <PageLoader pageId={id} key={id}>
          {page => <PageContainer anchor={anchor} id={id} page={page} />}
        </PageLoader>
      )}
    </View>
  )
}

export default PageContent
