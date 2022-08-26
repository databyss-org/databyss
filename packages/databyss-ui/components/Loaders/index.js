import React from 'react'

import { useCatalogContext } from '@databyss-org/services/catalog/CatalogProvider'
import { useEditorPageContext } from '@databyss-org/services/editorPage/EditorPageProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import MakeLoader from '@databyss-org/ui/components/Loaders/MakeLoader'
import { useQueryClient } from 'react-query'

export const EditorPageLoader = ({ children, pageId, firstBlockIsTitle }) => {
  const { getPage, removePageFromCache } = useEditorPageContext()
  const queryClient = useQueryClient()

  const onLoad = (page) => {
    queryClient.setQueryData(`useDocument_${page._id}`, page)
  }
  return (
    <MakeLoader
      resources={getPage(pageId, firstBlockIsTitle)}
      children={children}
      onUnload={() => removePageFromCache(pageId)}
      onLoad={onLoad}
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
