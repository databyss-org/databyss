import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { useCatalogContext } from '@databyss-org/services/catalog/CatalogProvider'
import MakeLoader from './MakeLoader'

export const PageLoader = ({ children, pageId }) => {
  const { getPage, removePageFromCache } = usePageContext()
  return MakeLoader({
    resource: getPage(pageId),
    children,
    onUnload: () => removePageFromCache(pageId),
  })
}

export const withPage = Wrapped => ({ pageId, ...others }) => (
  <PageLoader pageId={pageId}>
    {page => <Wrapped page={page} {...others} />}
  </PageLoader>
)

export const PagesLoader = ({ children }) => {
  const { getPages } = usePageContext()
  return MakeLoader({ resource: getPages(), children })
}

export const withPages = Wrapped => ({ ...others }) => (
  <PagesLoader>{pages => <Wrapped pages={pages} {...others} />}</PagesLoader>
)

export const EntrySearchLoader = ({ query, children }) => {
  const searchEntries = useEntryContext(c => c.searchEntries)
  const resource = useEntryContext(c => c.searchCache[query.replace(/\?/g, '')])
  searchEntries(query.replace(/\?/g, ''))
  return MakeLoader({ resource, children })
}

export const SourceLoader = ({ sourceId, children }) => {
  const getSource = useSourceContext(c => c.getSource)

  return MakeLoader({ resource: getSource(sourceId), children })
}

export const withSource = Wrapped => ({ sourceId, ...others }) => (
  <SourceLoader sourceId={sourceId}>
    {source => <Wrapped source={source} {...others} />}
  </SourceLoader>
)

export const CatalogSearchLoader = ({ query, type, children }) => {
  const searchCatalog = useCatalogContext(c => c && c.searchCatalog)
  if (!searchCatalog) {
    return children
  }
  return MakeLoader({ resource: searchCatalog({ query, type }), children })
}

export const AllTopicsLoader = ({ children }) => {
  const getTopicHeaders = useTopicContext(c => c.getTopicHeaders)
  return MakeLoader({ resource: getTopicHeaders(), children })
}

export const TopicLoader = ({ topicId, children }) => {
  const getTopic = useTopicContext(c => c.getTopic)
  return MakeLoader({ resource: getTopic(topicId), children })
}

export const AuthorsLoader = ({ children }) => {
  const getAuthors = useSourceContext(c => c.getAuthors)
  return MakeLoader({ resource: getAuthors(), children })
}

export const SourceCitationsLoader = ({ children }) => {
  const getSourceCitations = useSourceContext(c => c.getSourceCitations)
  return MakeLoader({ resource: getSourceCitations(), children })
}

export const BlockRelationsLoader = ({ children, atomicId }) => {
  const findBlockRelations = useEntryContext(c => c.findBlockRelations)

  const clearBlockRelationsCache = useEntryContext(
    c => c.clearBlockRelationsCache
  )
  return MakeLoader({
    resource: findBlockRelations(atomicId),
    children,
    onUnload: () => clearBlockRelationsCache(),
  })
}
