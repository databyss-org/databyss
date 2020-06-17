import React, { useEffect } from 'react'
import { Router } from '@reach/router'
<<<<<<< HEAD
=======
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import {
  Text,
  View,
  BaseControl,
  ScrollView,
} from '@databyss-org/ui/primitives'
>>>>>>> Adding list of all authors with route
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
