import React from 'react'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
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
  const resource = useEntryContext(c => c.searchCache[query])
  searchEntries(query)

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

export const SearchSourceLoader = ({ query, children }) => {
  const searchSource = useSourceContext(c => c.searchSource)

  const getSearchCache = useSourceContext(c => c.getSearchCache)

  searchSource(query)

  return MakeLoader({ resource: getSearchCache(query), children })
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
