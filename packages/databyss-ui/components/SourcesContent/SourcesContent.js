import React, { useEffect } from 'react'
import { Router } from '@reach/router'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
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

  const sourcesData = () =>
    Object.values(state.cache).map(value => ({
      id: value._id,
      text: value.text.textValue,
    }))

  const sortedSources = sourcesData().sort((a, b) => (a.text > b.text ? 1 : -1))
  return (
    <IndexPageContent title="All Sources">
      <IndexPageEntries entries={sortedSources} />
    </IndexPageContent>
  )
}

export default SourcesContent
