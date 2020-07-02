import React, { useEffect } from 'react'
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

export const SourcesRouter = () => (
  <Router>
    <SourcesContent path="/" />
  </Router>
)

const SourcesContent = () => {
  const { getAllSources, state } = useSourceContext()
  useEffect(() => getAllSources(), [])

  const sourcesData = getSourcesData(state.cache)
  const sortedSources = sortEntriesAtoZ(sourcesData)

  return (
    <IndexPageContent title="All Sources">
      <IndexPageEntries entries={sortedSources} />
    </IndexPageContent>
  )
}

export default SourcesContent
