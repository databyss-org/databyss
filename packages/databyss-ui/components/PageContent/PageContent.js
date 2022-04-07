import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  const focusIndex = useEditorPageContext((c) => c.focusIndex)
  const [, setAuthToken] = useState()
  const [editorPath, setEditorPath] = useState(null)
  const location = useLocation()
  const getTokensFromPath = useNavigationContext((c) => c.getTokensFromPath)
  const navigate = useNavigationContext((c) => c.navigate)
  const editorRef = useRef()
  const pagesRes = usePages()
  const { nice } = getTokensFromPath()

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
    if (redirectTo !== location.pathname) {
      updateUrl(redirectTo)
    }
  }, [pagesRes.data?.[page._id]?.name])

  return (
    <>
      <PageSticky pagePath={editorPath} pageId={page._id} />
      <PageContentView {...others}>
        {isReadOnly ? (
          <FlatPageBody page={page} />
        ) : (
          <PageBody
            onEditorPathChange={setEditorPath}
            editorRef={editorRef}
            page={page}
            focusIndex={focusIndex}
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
