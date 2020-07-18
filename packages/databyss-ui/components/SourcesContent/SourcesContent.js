import React from 'react'
import { Router } from '@reach/router'
import {
  sortEntriesAtoZ,
  createIndexPageEntries,
} from '@databyss-org/services/entries/util'
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
      const sourcesData = Object.values(sourceCitations).map(value =>
        createIndexPageEntries({
          text: value.text.textValue,
          citations: value.detail.citations?.map(
            citation => citation.text?.textValue
          ),
          type: 'sources',
        })
      )

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
