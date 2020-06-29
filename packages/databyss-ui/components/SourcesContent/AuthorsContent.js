import React, { useEffect } from 'react'
import { Router } from '@reach/router'
import { EntrySearchLoader } from '@databyss-org/ui/components/Loaders'
import {
  Text,
  View,
  BaseControl,
  ScrollView,
} from '@databyss-org/ui/primitives'
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
      const author = value.authors[0]

      return {
        id: value._id,
        text: value.text.textValue,
        author: author
          ? `${author.lastName.textValue}, ${author.firstName.textValue}`
          : 'Unknown author',
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
