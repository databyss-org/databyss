import React from 'react'
import { pickBy } from 'lodash'
import { usePageContext } from '@databyss-org/services/pages/PageProvider'
import { useEntryContext } from '@databyss-org/services/entries/EntryProvider'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import { useTopicContext } from '@databyss-org/services/topics/TopicProvider'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { useCatalogContext } from '@databyss-org/services/catalog/CatalogProvider'
import MakeLoader from '@databyss-org/ui/components/Loaders/MakeLoader'
import { isResourceReady } from './_helpers'

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

export const PagesLoader = ({ children, filtered, archived }) => {
  const { getPages } = usePageContext()

  let _resources = getPages()

  if (filtered && isResourceReady(_resources)) {
    _resources = pickBy(_resources, page => !page.archive)
  }

  if (archived && isResourceReady(_resources)) {
    _resources = pickBy(_resources, page => page.archive)
  }

  return <MakeLoader resources={_resources} children={children} />
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

export const AllTopicsLoader = ({ children, filtered, ...others }) => {
  const getTopicHeaders = useTopicContext(c => c.getTopicHeaders)
  let _resource = getTopicHeaders()

  if (filtered && isResourceReady(_resource)) {
    _resource = pickBy(_resource, topic => topic.isInPages?.length)
  }

  return <MakeLoader resources={_resource} children={children} {...others} />
}

AllTopicsLoader.defaultProps = {
  filtered: true,
}

export const AccountLoader = ({ children }) => {
  const getUserAccount = useSessionContext(c => c && c.getUserAccount)
  return <MakeLoader resources={getUserAccount()} children={children} />
}

export const TopicLoader = ({ topicId, children }) => {
  const getTopic = useTopicContext(c => c.getTopic)

  return <MakeLoader resources={getTopic(topicId)} children={children} />
}

export const AuthorsLoader = ({ children, filtered }) => {
  const getAuthors = useSourceContext(c => c.getAuthors)

  let _results = getAuthors()
  // if filtered is pass as a prop, remove resource that dont appear on a page
  if (filtered && isResourceReady(_results)) {
    _results = pickBy(_results, author => author.isInPages?.length)
  }
  return <MakeLoader resources={_results} children={children} />
}
AuthorsLoader.defaultProps = {
  filtered: true,
}

export const SourceCitationsLoader = ({ children, filtered, ...others }) => {
  const getSourceCitations = useSourceContext(c => c.getSourceCitations)
  let _resource = getSourceCitations()
  if (filtered && isResourceReady(_resource)) {
    _resource = pickBy(_resource, citation => citation.isInPages?.length)
  }
  return <MakeLoader resources={_resource} children={children} {...others} />
}
SourceCitationsLoader.defaultProps = {
  filtered: true,
}

export const SearchAllLoader = ({ children, filtered, ...others }) => {
  const getAuthors = useSourceContext(c => c.getAuthors)
  const getTopicHeaders = useTopicContext(c => c.getTopicHeaders)
  const { getPages } = usePageContext()
  const getSourceCitations = useSourceContext(c => c.getSourceCitations)

  let sourceCitations = getSourceCitations()
  if (filtered && isResourceReady(sourceCitations)) {
    sourceCitations = pickBy(
      sourceCitations,
      citation => citation.isInPages?.length
    )
  }

  let authors = getAuthors()
  if (filtered && isResourceReady(authors)) {
    authors = pickBy(authors, author => author.isInPages?.length)
  }

  let topics = getTopicHeaders()
  if (filtered && isResourceReady(topics)) {
    topics = pickBy(topics, topic => topic.isInPages?.length)
  }

  const pages = getPages()

  const allResources = [sourceCitations, authors, topics, pages]

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
