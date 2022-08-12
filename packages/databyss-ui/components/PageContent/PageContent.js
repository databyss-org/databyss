import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useQueryClient } from 'react-query'
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
import { urlSafeName, validUriRegex } from '@databyss-org/services/lib/util'
import { useDocuments, usePages } from '@databyss-org/data/pouchdb/hooks'
import { debounce } from 'lodash'
import { PageBody } from './PageBody'
import { FlatPageBody } from './FlatPageBody'
import PageSticky from './PageSticky'
import LoadingFallback from '../Notify/LoadingFallback'

// const INTERACTION_EVENTS = 'pointerdown keydown wheel touchstart focusin'

export const PageContainer = ({ page, isReadOnly, ...others }) => {
  const focusIndex = useEditorPageContext((c) => c.focusIndex)
  const [, setAuthToken] = useState()
  const [editorPath, setEditorPath] = useState(null)
  const location = useLocation()
  const getTokensFromPath = useNavigationContext((c) => c.getTokensFromPath)
  const navigate = useNavigationContext((c) => c.navigate)
  const pagesRes = usePages()
  const path = getTokensFromPath()

  // confirms a token is in local pouch in order to show account menu
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
      if (!path.nice?.length) {
        redirectTo = `${location.pathname}/${niceName}${location.hash}`
      } else if (path.nice.join('/') !== niceName) {
        redirectTo = `/${path.type}/${path.params}/${niceName}${location.hash}`
      }
    }
    if (redirectTo !== location.pathname) {
      updateUrl(redirectTo)
    }
  }, [pagesRes.data?.[page._id]?.name])

  // preload embed docs into cache
  const queryClient = useQueryClient()
  const linkedDocsRes = useDocuments(getLinkedDocIds(page), {
    subscribe: false,
  })

  if (linkedDocsRes.isSuccess) {
    Object.values(linkedDocsRes.data).forEach((_doc) => {
      queryClient.setQueryData(`useDocument_${_doc._id}`, _doc)
    })
  }

  return useMemo(
    () =>
      linkedDocsRes.isSuccess ? (
        <>
          <PageSticky pagePath={editorPath} pageId={page._id} />
          <View
            pt="small"
            flexShrink={1}
            flexGrow={1}
            overflow="hidden"
            {...others}
          >
            {isReadOnly ? (
              <FlatPageBody page={page} />
            ) : (
              <PageBody
                onEditorPathChange={setEditorPath}
                page={page}
                focusIndex={focusIndex}
              />
            )}
          </View>
        </>
      ) : (
        <LoadingFallback resource={linkedDocsRes} />
      ),
    [
      linkedDocsRes.isSuccess,
      isReadOnly,
      page._id,
      focusIndex,
      editorPath?.path?.join('/'),
    ]
  )
}

const PageContent = (others) => {
  // get page id and anchor from url
  const { id } = useParams()
  const getTokensFromPath = useNavigationContext((c) => c.getTokensFromPath)
  const { anchor } = getTokensFromPath()
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

function getLinkedDocIds(page) {
  const _docIds = {}
  page.blocks.forEach((_block) => {
    _block.text.ranges.forEach((_range) => {
      _range.marks.forEach((_mark) => {
        if (
          Array.isArray(_mark) &&
          _mark.length > 1 &&
          !_mark[1].match(validUriRegex)
        ) {
          _docIds[_mark[1]] = true
        }
      })
    })
  })
  return Object.keys(_docIds)
}

export default PageContent
