import React, { useEffect } from 'react'
import { Router } from '@reach/router'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

export const AuthorsRouter = () => (
  <Router>
    <AuthorsContent path="/" />
  </Router>
)

const AuthorsContent = () => {
  const { getAllSources, state } = useSourceContext()
  useEffect(() => getAllSources(), [])

  const sourcesData = () =>
    Object.entries(state.cache).map(([, value]) => {
      const author = value.authors?.[0]
      const firstName = author?.firstName?.textValue
      const lastName = author?.lastName?.textValue

      return {
        id: value._id,
        text: author && `${lastName}${firstName && `, ${firstName}`}`,
      }
    })

  const sortedSources = sourcesData().sort(
    (a, b) => (a.author > b.author ? 1 : -1)
  )

  return (
    <IndexPageContent title="All Authors">
      <IndexPageEntries entries={sortedSources} page="authors" />
    </IndexPageContent>
  )
}

export default AuthorsContent
