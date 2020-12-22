import React, { useState, useEffect, useRef } from 'react'
import {
  useParams,
  useLocation,
  Router,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { getAuthToken } from '@databyss-org/services/session/clientStorage'
import { PageLoader } from '@databyss-org/ui/components/Loaders'
import { View } from '@databyss-org/ui/primitives'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import PageHeader from './PageHeader'
import PageBody from './PageBody'
import PageSticky from './PageSticky'
import { isMobile } from '../../lib/mediaQuery'
import AccountMenu from './AccountMenu'

export const PageContainer = React.memo(
  ({ anchor, id, page, ...others }) => {
    const getBlockRefByIndex = usePageContext((c) => c.getBlockRefByIndex)

    const [editorPath, setEditorPath] = useState(null)
    const isPublicAccount = useSessionContext((c) => c && c.isPublicAccount)

    const headerRef = useRef()
    const editorRef = useRef()
    const editorWindowRef = useRef()

    // index is used to set selection in slate
    const [index, setIndex] = useState(null)

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
              if (editorWindowRef.current) {
                // to compensate for the sticky header
                // https://github.com/iamdustan/smoothscroll/issues/47#issuecomment-350810238
                const item = _ref
                const wrapper = editorWindowRef.current
                const count = item.offsetTop - wrapper.scrollTop - 74
                wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
              }
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
      if (editorRef.current?.focus) {
        editorRef.current.focus()
      }
    }

    return (
      <View height="100%" overflowY="auto" ref={editorWindowRef} {...others}>
        <View
          pl="medium"
          pr="medium"
          pb="medium"
          pt={isPublicAccount() || isMobile() ? 'large' : 'none'}
          flexGrow={1}
        >
          {!isPublicAccount() && !isMobile() && (
            <PageSticky pagePath={editorPath} pageId={page._id} />
          )}
          {getAuthToken() && isPublicAccount() && !isMobile() && (
            <View position="absolute" right="extraLarge">
              <AccountMenu />
            </View>
          )}
          <PageHeader
            ref={headerRef}
            pageId={id}
            onNavigateDownFromHeader={onNavigateDownToEditor}
          />
          <PageBody
            onEditorPathChange={setEditorPath}
            editorRef={editorRef}
            page={page}
            focusIndex={index}
            onNavigateUpFromEditor={onNavigateUpFromEditor}
          />
        </View>
      </View>
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
        <PageLoader pageId={id} key={id}>
          {(page) => (
            <PageContainer anchor={anchor} id={id} page={page} {...others} />
          )}
        </PageLoader>
      )}
    </View>
  )
}

// components
export const PageRouter = () => (
  <Router>
    <PageContent path=":id" />
  </Router>
)

export default PageContent
