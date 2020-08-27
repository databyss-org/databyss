import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { useCatalogContext } from '@databyss-org/services/catalog/CatalogProvider'
import MakeLoader from '@databyss-org/ui/components/Loaders/MakeLoader'

export const PageLoader = ({ children, pageId, LoadingFallback }) => {
  const { getPage, removePageFromCache } = usePageContext()
  return (
    <MakeLoader
      resources={getPage(pageId)}
      children={children}
      onUnload={() => removePageFromCache(pageId)}
      loadingFallback={LoadingFallback}
    />
  )
}

export const withPage = Wrapped => ({ pageId, ...others }) => (
  <PageLoader pageId={pageId}>
    {page => <Wrapped page={page} {...others} />}
  </PageLoader>
)

export const PagesLoader = ({ children, LoadingFallback }) => {
  const { getPages } = usePageContext()
  return (
    <MakeLoader
      resources={getPages()}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}

export const withPages = Wrapped => ({ ...others }) => (
  <PagesLoader>{pages => <Wrapped pages={pages} {...others} />}</PagesLoader>
)

export const EntrySearchLoader = ({ query, children, LoadingFallback }) => {
  const searchEntries = useEntryContext(c => c.searchEntries)
  const resources = useEntryContext(
    c => c.searchCache[query.replace(/\?/g, '')]
  )
  searchEntries(query.replace(/\?/g, ''))
  return (
    <MakeLoader
      resources={resources}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}

export const SourceLoader = ({ sourceId, children, LoadingFallback }) => {
  const getSource = useSourceContext(c => c.getSource)

  return (
    <MakeLoader
      resources={getSource(sourceId)}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}

export const withSource = Wrapped => ({ sourceId, ...others }) => (
  <SourceLoader sourceId={sourceId}>
    {source => <Wrapped source={source} {...others} />}
  </SourceLoader>
)

export const CatalogSearchLoader = ({
  query,
  type,
  children,
  LoadingFallback,
}) => {
  const searchCatalog = useCatalogContext(c => c && c.searchCatalog)
  if (!searchCatalog) {
    return children
  }
  return (
    <MakeLoader
      resources={searchCatalog({ query, type })}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}

export const AllTopicsLoader = ({ children, LoadingFallback, ...others }) => {
  const getTopicHeaders = useTopicContext(c => c.getTopicHeaders)
  return (
    <MakeLoader
      resources={getTopicHeaders()}
      children={children}
      LoadingFallback={LoadingFallback}
      {...others}
    />
  )
}

export const TopicLoader = ({ topicId, children, LoadingFallback }) => {
  const getTopic = useTopicContext(c => c.getTopic)
  return (
    <MakeLoader
      resources={getTopic(topicId)}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}

export const AuthorsLoader = ({ children, LoadingFallback }) => {
  const getAuthors = useSourceContext(c => c.getAuthors)
  return (
    <MakeLoader
      resources={getAuthors()}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}

export const SourceCitationsLoader = ({
  children,
  LoadingFallback,
  ...others
}) => {
  const getSourceCitations = useSourceContext(c => c.getSourceCitations)
  return (
    <MakeLoader
      resources={getSourceCitations()}
      children={children}
      LoadingFallback={LoadingFallback}
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

  const allResources = [{ sourceCitations }, { authors }, { topics }, { pages }]

  return <MakeLoader resources={allResources} children={children} {...others} />
}

export const BlockRelationsLoader = ({
  children,
  atomicId,
  LoadingFallback,
}) => {
  const findBlockRelations = useEntryContext(c => c.findBlockRelations)

  const clearBlockRelationsCache = useEntryContext(
    c => c.clearBlockRelationsCache
  )
  return (
    <MakeLoader
      resources={findBlockRelations(atomicId)}
      onUnload={() => clearBlockRelationsCache()}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}
