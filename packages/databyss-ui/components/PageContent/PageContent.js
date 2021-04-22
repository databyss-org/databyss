import React, { useState, useEffect, useRef } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import {
  useParams,
  useLocation,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { EditorPageLoader } from '@databyss-org/ui/components/Loaders'
import { View } from '@databyss-org/ui/primitives'
import { useEditorPageContext } from '@databyss-org/services'
import { getAuthToken } from '@databyss-org/services/session/clientStorage'
import PageBody from './PageBody'
import PageSticky from './PageSticky'

export const PageContentView = ({ children, ...others }) => (
  <View pt="small" flexShrink={1} flexGrow={1} overflow="hidden" {...others}>
    {children}
  </View>
)

export const PageContainer = React.memo(
  ({ anchor, page, ...others }) => {
    const getBlockRefByIndex = useEditorPageContext((c) => c.getBlockRefByIndex)
    const [, setAuthToken] = useState()
    const [editorPath, setEditorPath] = useState(null)

    const editorRef = useRef()

    // index is used to set selection in slate
    const [index, setIndex] = useState(null)

    /*
  confirms a token is in local pouch in order to show account menu
  */

    useEffect(() => {
      const _token = getAuthToken()
      if (_token) {
        setAuthToken(true)
      }
    }, [])

    useEffect(() => {
      // if anchor link exists, scroll to anchor
      if (anchor) {
        // get index value of anchor on page
        const _index = page.blocks.findIndex((b) => b._id === anchor)
        if (_index > -1) {
          setIndex(_index)
          const _ref = getBlockRefByIndex(_index)
          if (_ref) {
            window.requestAnimationFrame(() => {
              scrollIntoView(_ref)
            })
          }
        }
      }
    }, [])

    return (
      <>
        <PageSticky pagePath={editorPath} pageId={page._id} />
        <PageContentView {...others}>
          <PageBody
            onEditorPathChange={setEditorPath}
            editorRef={editorRef}
            page={page}
            focusIndex={index}
          />
        </PageContentView>
      </>
    )
  },
  (prev, next) =>
    prev.page._id === next.page._id &&
    prev.id === next.id &&
    prev.anchor === next.anchor
)

const PageContent = (others) => {
  // get page id and anchor from url
  const { id } = useParams()
  const anchor = useLocation().hash.substring(1)

  /*
  use same route to update name, just pass it name 
  */

  return (
    <View flex="1" height="100%" backgroundColor="background.1">
      {id && (
        <EditorPageLoader pageId={id} key={id}>
          {(page) => (
            <PageContainer anchor={anchor} id={id} page={page} {...others} />
          )}
        </EditorPageLoader>
      )}
    </View>
  )
}

export default PageContent
