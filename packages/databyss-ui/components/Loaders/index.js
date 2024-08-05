import React, { useRef } from 'react'

import { useCatalogContext } from '@databyss-org/services/catalog/CatalogProvider'
import { useEditorPageContext } from '@databyss-org/services/editorPage/EditorPageProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import MakeLoader from '@databyss-org/ui/components/Loaders/MakeLoader'
import { useQueryClient } from '@tanstack/react-query'
import { ResourcePending } from '@databyss-org/services/interfaces'

export const EditorPageLoader = ({ children, pageId, firstBlockIsTitle }) => {
  const { getPage, removePageFromCache } = useEditorPageContext()
  const prevResourceRef = useRef(null)
  const queryClient = useQueryClient()
  const navigateToDefaultPage = useSessionContext(
    (c) => c && c.navigateToDefaultPage
  )

  const onLoad = (page) => {
    queryClient.setQueryData([`useDocument_${page._id}`], page)
  }
  let _res = getPage(pageId, firstBlockIsTitle)

  if (window.eapi.isWeb) {
    if ((!_res || _res instanceof ResourcePending) && prevResourceRef.current) {
      _res = prevResourceRef.current
    }
    if (_res && !(_res instanceof ResourcePending)) {
      prevResourceRef.current = _res
    }
  }

  return (
    <MakeLoader
      key={pageId}
      resources={_res}
      children={children}
      onUnload={() => removePageFromCache(pageId)}
      onLoad={onLoad}
      onError={navigateToDefaultPage}
    />
  )
}

export const CatalogSearchLoader = ({ query, type, children }) => {
  const searchCatalog = useCatalogContext((c) => c && c.searchCatalog)
  if (!searchCatalog) {
    return children
  }
  return (
    <MakeLoader
      resources={searchCatalog({ query, type })}
      children={children}
    />
  )
}

export const AccountLoader = ({ children }) => {
  const getUserAccount = useSessionContext((c) => c && c.getUserAccount)
  return (
    <MakeLoader
      resources={getUserAccount()}
      children={children}
      loadingFallbackOptions={{
        size: '15',
      }}
      errorFallback=""
    />
  )
}
