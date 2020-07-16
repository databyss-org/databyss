import React from 'react'
import { Router } from '@reach/router'
import { sortEntriesAtoZ } from '@databyss-org/services/sources/util'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import AuthorsContent from '@databyss-org/ui/components/SourcesContent/AuthorsContent'
import AuthorCitations from '@databyss-org/ui/components/SourcesContent/AuthorCitations'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

export const SourcesRouter = () => (
  <Router>
    <SourcesContent path="/" />
    <AuthorsContent path="/authors" />
    <AuthorCitations path=":query" />
  </Router>
)

const SourcesContent = () => (
  <SourceCitationsLoader>
    {sourceCitations => {
      const sourcesData = Object.values(sourceCitations).map(value => ({
        text: value.text,
        citations: value.citations?.map(citation => citation.text?.textValue),
        type: 'sources',
      }))

      const sortedSources = sortEntriesAtoZ(sourcesData, 'text')

      return (
        <IndexPageContent title="Sources">
          <IndexPageEntries entries={sortedSources} />
        </IndexPageContent>
      )
    }}
  </SourceCitationsLoader>
)

export default SourcesContent
