import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { useCatalogContext } from '@databyss-org/services/catalog/CatalogProvider'
import MakeLoader from '@databyss-org/ui/components/Loaders/MakeLoader'

export const PageLoader = ({ children, pageId }) => {
  const { getPage, removePageFromCache } = usePageContext()
  return (
    <MakeLoader
      resources={getPage(pageId)}
      children={children}
      onUnload={() => removePageFromCache(pageId)}
    />
  )
}

export const withPage = Wrapped => ({ pageId, ...others }) => (
  <PageLoader pageId={pageId}>
    {page => <Wrapped page={page} {...others} />}
  </PageLoader>
)

export const PagesLoader = ({ children }) => {
  const { getPages } = usePageContext()
  return <MakeLoader resources={getPages()} children={children} />
}

export const withPages = Wrapped => ({ ...others }) => (
  <PagesLoader>{pages => <Wrapped pages={pages} {...others} />}</PagesLoader>
)

export const EntrySearchLoader = ({ query, children }) => {
  const searchEntries = useEntryContext(c => c.searchEntries)
  const resources = useEntryContext(
    c => c.searchCache[query.replace(/\?/g, '')]
  )
  searchEntries(query.replace(/\?/g, ''))
  return <MakeLoader resources={resources} children={children} />
}

export const SourceLoader = ({ sourceId, children }) => {
  const getSource = useSourceContext(c => c.getSource)

  return <MakeLoader resources={getSource(sourceId)} children={children} />
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
  return (
    <MakeLoader
      resources={searchCatalog({ query, type })}
      children={children}
    />
  )
}

export const AllTopicsLoader = ({ children, ...others }) => {
  const getTopicHeaders = useTopicContext(c => c.getTopicHeaders)
  return (
    <MakeLoader resources={getTopicHeaders()} children={children} {...others} />
  )
}

export const TopicLoader = ({ topicId, children }) => {
  const getTopic = useTopicContext(c => c.getTopic)
  return <MakeLoader resources={getTopic(topicId)} children={children} />
}

export const AuthorsLoader = ({ children }) => {
  const getAuthors = useSourceContext(c => c.getAuthors)
  return <MakeLoader resources={getAuthors()} children={children} />
}

export const SourceCitationsLoader = ({ children, ...others }) => {
  const getSourceCitations = useSourceContext(c => c.getSourceCitations)
  return (
    <MakeLoader
      resources={getSourceCitations()}
      children={children}
      {...others}
    />
  )
}

export const SearchAllLoader = ({ children, ...others }) => {
  const getAuthors = useSourceContext(c => c.getAuthors)
  const getTopicHeaders = useTopicContext(c => c.getTopicHeaders)
  const { getPages } = usePageContext()
  const getSourceCitations = useSourceContext(c => c.getSourceCitations)

  const sourceCitations = getSourceCitations()
  const authors = getAuthors()
  const topics = getTopicHeaders()
  const pages = getPages()

  const allResources = { sourceCitations, authors, topics, pages }

  return <MakeLoader resources={allResources} children={children} {...others} />
}

export const BlockRelationsLoader = ({ children, atomicId }) => {
  const findBlockRelations = useEntryContext(c => c.findBlockRelations)

  const clearBlockRelationsCache = useEntryContext(
    c => c.clearBlockRelationsCache
  )
  return (
    <MakeLoader
      resources={findBlockRelations(atomicId)}
      onUnload={() => clearBlockRelationsCache()}
      children={children}
    />
  )
}
