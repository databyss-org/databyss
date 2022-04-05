import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import {
  useParams,
  useLocation,
} from '@databyss-org/ui/components/Navigation/NavigationProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { EditorPageLoader } from '@databyss-org/ui/components/Loaders'
import { View } from '@databyss-org/ui/primitives'
import { useEditorPageContext } from '@databyss-org/services'
import { useNavigationContext } from '@databyss-org/ui'
import { getAuthToken } from '@databyss-org/services/session/clientStorage'
import { urlSafeName } from '@databyss-org/services/lib/util'
import { usePages } from '@databyss-org/data/pouchdb/hooks'
import { debounce } from 'lodash'
import { PageBody } from './PageBody'
import { FlatPageBody } from './FlatPageBody'
import PageSticky from './PageSticky'

export const PageContentView = ({ children, ...others }) => (
  <View pt="small" flexShrink={1} flexGrow={1} overflow="hidden" {...others}>
    {children}
  </View>
)

export const PageContainer = ({ page, isReadOnly, ...others }) => {
  const getBlockRefByIndex = useEditorPageContext((c) => c.getBlockRefByIndex)
  const [, setAuthToken] = useState()
  const [editorPath, setEditorPath] = useState(null)
  const location = useLocation()
  const getTokensFromPath = useNavigationContext((c) => c.getTokensFromPath)
  const navigate = useNavigationContext((c) => c.navigate)
  const editorRef = useRef()
  const pagesRes = usePages()
  const { anchor, nice } = getTokensFromPath()

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

  const updateUrl = useCallback(
    debounce((url) => {
      navigate(url, { replace: true })
    }, 1000)
  )

  useEffect(() => {
    const niceName = urlSafeName(pagesRes.data?.[page._id]?.name)
    let redirectTo = location.pathname

    if (niceName) {
      if (!nice?.length) {
        redirectTo = `${location.pathname}/${niceName}`
      } else if (nice.join('/') !== niceName) {
        redirectTo = `${location.pathname.replace(nice.join('/'), niceName)}`
      }
    }

    // if anchor link exists, scroll to anchor
    if (anchor) {
      let _index = -1
      // if anchor contains '/:blockIndex', use the block index
      if (anchor.match('/')) {
        _index = parseInt(anchor.split('/')[1], 10)
      } else {
        // get index value of anchor on page
        _index = page.blocks.findIndex((b) => b._id === anchor)
      }
      if (_index > -1) {
        setIndex(_index)
        const _ref = getBlockRefByIndex(_index)
        if (_ref) {
          window.requestAnimationFrame(() => {
            scrollIntoView(_ref)
            // navigate(redirectTo, { replace: true })
            // window.history.replaceState('', '', redirectTo)
            updateUrl(redirectTo)
          })
        }
      }
    }
    // if no nice URL, make one and redirect
    if (redirectTo !== location.pathname) {
      // navigate(redirectTo, { replace: true })
      // window.history.replaceState('', '', redirectTo)
      updateUrl(redirectTo)
    }
  }, [pagesRes.data?.[page._id]?.name])

  const _readOnly = isReadOnly || window.location.search.includes('__readonly')

  return (
    <>
      <PageSticky pagePath={editorPath} pageId={page._id} />
      <PageContentView {...others}>
        {_readOnly ? (
          <FlatPageBody page={page} />
        ) : (
          <PageBody
            onEditorPathChange={setEditorPath}
            editorRef={editorRef}
            page={page}
            focusIndex={index}
          />
        )}
      </PageContentView>
    </>
  )
}

const PageContent = ({ anchor, ...others }) => {
  // get page id and anchor from url
  const { id } = useParams()
  const isReadOnly = useSessionContext((c) => c && c.isReadOnly)

  /*
  use same route to update name, just pass it name 
  */

  return useMemo(
    () => (
      <View flex="1" height="100%" backgroundColor="background.1">
        {id && (
          <EditorPageLoader pageId={id} key={id} firstBlockIsTitle>
            {(page) => (
              <PageContainer
                id={id}
                page={page}
                anchor={anchor}
                isReadOnly={isReadOnly}
                {...others}
              />
            )}
          </EditorPageLoader>
        )}
      </View>
    ),
    [id, isReadOnly, anchor]
  )
}

export default PageContent
