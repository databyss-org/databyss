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
      resource={getPage(pageId)}
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
      resource={getPages()}
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
  const resource = useEntryContext(c => c.searchCache[query.replace(/\?/g, '')])
  searchEntries(query.replace(/\?/g, ''))
  return (
    <MakeLoader
      resource={resource}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}

export const SourceLoader = ({ sourceId, children, LoadingFallback }) => {
  const getSource = useSourceContext(c => c.getSource)

  return (
    <MakeLoader
      resource={getSource(sourceId)}
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
      resource={searchCatalog({ query, type })}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}

export const AllTopicsLoader = ({ children, LoadingFallback, ...others }) => {
  const getTopicHeaders = useTopicContext(c => c.getTopicHeaders)
  return (
    <MakeLoader
      resource={getTopicHeaders()}
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
      resource={getTopic(topicId)}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}

export const AuthorsLoader = ({ children, LoadingFallback }) => {
  const getAuthors = useSourceContext(c => c.getAuthors)
  return (
    <MakeLoader
      resource={getAuthors()}
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
      resource={getSourceCitations()}
      children={children}
      LoadingFallback={LoadingFallback}
      {...others}
    />
  )
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
      resource={findBlockRelations(atomicId)}
      onUnload={() => clearBlockRelationsCache()}
      children={children}
      LoadingFallback={LoadingFallback}
    />
  )
}
