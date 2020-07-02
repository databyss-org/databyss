import React, { useEffect } from 'react'
import { Router } from '@reach/router'
import { useSourceContext } from '@databyss-org/services/sources/SourceProvider'
import {
  getSourcesData,
  sortEntriesAtoZ,
} from '@databyss-org/services/sources/util'
import { groupBy, uniqBy } from 'lodash'
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

  // const cleanSources = sourcesData().filter(entry => entry.text !== undefined)
  // remove duplicate entries
  // const uniqueAuthorList = uniqBy(sortedSources, 'text')
  // const groupedAuthorList = groupBy(sortedSources, 'text')

  return (
    <IndexPageContent title="All Authors">
      <IndexPageEntries entries={sortedAuthors} page="authors" />
    </IndexPageContent>
  )
}

export default AuthorsContent
