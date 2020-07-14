import React from 'react'
import { Router } from '@reach/router'
import {
  getSourcesData,
  sortEntriesAtoZ,
} from '@databyss-org/services/sources/util'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import {
  getSourcesData,
  sortEntriesAtoZ,
} from '@databyss-org/services/sources/util'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'

export const SourcesRouter = () => (
  <Router>
    <SourcesContent path="/" />
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
      console.log(sourcesData)

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
