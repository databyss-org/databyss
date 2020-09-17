import React from 'react'
import { Helmet } from 'react-helmet'
import { Router } from '@reach/router'
import {
  sortEntriesAtoZ,
  createIndexPageEntries,
} from '@databyss-org/services/entries/util'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import SourcesCitations from '@databyss-org/ui/components/SourcesContent/SourcesCitations'
import AuthorsContent from '@databyss-org/ui/components/SourcesContent/AuthorsContent'
import AuthorCitations from '@databyss-org/ui/components/SourcesContent/AuthorCitations'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

export const SourcesRouter = () => (
  <Router>
    <SourcesContent path="/" />
    <SourcesCitations path="/:query" />
    <AuthorsContent path="/authors" />
  </Router>
)

const SourcesContentBody = (sourceCitations, navigate) => {
  const sourcesData = Object.values(sourceCitations).map(value =>
    createIndexPageEntries({
      id: value._id,
      text: value.text?.textValue,
      citations: value.detail?.citations?.map(
        citation => citation.text?.textValue
      ),
      type: 'sources',
    })
  )

  const sortedSources = sortEntriesAtoZ(sourcesData, 'text')

  const onSourceClick = source => {
    navigate(`/sources/${source.id}`)
  }

  return (
    <IndexPageContent title="All Sources">
      <Helmet>
        <meta charSet="utf-8" />
        <title>All Sources</title>
      </Helmet>
      <IndexPageEntries
        onClick={onSourceClick}
        entries={sortedSources}
        icon={<SourceSvg />}
      />
    </IndexPageContent>
  )
}

const SourcesContent = () => {
  const navigate = useNavigationContext(c => c.navigate)

  const getQueryParams = useNavigationContext(c => c.getQueryParams)

  // if author is provided in the url `.../sources?firstName=''&lastName='' render authors
  const _queryParams = getQueryParams()
  if (Object.keys(_queryParams).length) {
    return <AuthorCitations query={_queryParams} />
  }
  return (
    <SourceCitationsLoader filtered>
      {source => SourcesContentBody(source, navigate)}
    </SourceCitationsLoader>
  )
}

export default SourcesContent
