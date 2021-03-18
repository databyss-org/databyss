import React from 'react'

import { useCatalogContext } from '@databyss-org/services/catalog/CatalogProvider'
import { useEditorPageContext } from '@databyss-org/services/editorPage/EditorPageProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import MakeLoader from '@databyss-org/ui/components/Loaders/MakeLoader'

export const EditorPageLoader = ({ children, pageId }) => {
  const { getPage, removePageFromCache } = useEditorPageContext()

  return (
    <MakeLoader
      resources={getPage(pageId)}
      children={children}
      onUnload={() => removePageFromCache(pageId)}
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
      fallbackSize="15"
    />
  )
}
