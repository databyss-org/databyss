import React, { useEffect } from 'react'
import { Router } from '@reach/router'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
<<<<<<< HEAD
import {
  getSourcesData,
  sortEntriesAtoZ,
} from '@databyss-org/services/sources/util'
=======
>>>>>>> Creating IndexPageContent and entries components
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

  const authorList = getSourcesData(state.cache, 'authors')
  const sortedAuthors = sortEntriesAtoZ(authorList)

  return (
    <IndexPageContent title="All Authors">
      <IndexPageEntries entries={sortedAuthors} page="authors" />
    </IndexPageContent>
  )
}

export default AuthorsContent
