import React, { useMemo, memo } from 'react'
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

export const EntrySearchLoader = memo(({ query, children }) => {
  const { searchEntries, searchCache } = useEntryContext()
  searchEntries(query)

  return MakeLoader({ resource: searchCache[query], children })
})

export const SourceLoader = ({ sourceId, children }) => {
  const { getSource } = useSourceContext()
  return MakeLoader({ resource: getSource(sourceId), children })
}

export const withSource = Wrapped => ({ sourceId, ...others }) => (
  <SourceLoader sourceId={sourceId}>
    {source => <Wrapped source={source} {...others} />}
  </SourceLoader>
)

export const SearchSourceLoader = ({ query, children }) => {
  const { state, searchSource } = useSourceContext()
  searchSource(query)
  return MakeLoader({ resource: state.searchCache[query], children })
}

export const AllTopicsLoader = ({ children }) => {
  const { getAllTopics } = useTopicContext()
  return MakeLoader({ resource: getAllTopics(), children })
}
