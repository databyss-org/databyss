import React from 'react'
import { Helmet } from 'react-helmet'

import { createIndexPageEntries } from '@databyss-org/services/entries/util'
import {
  composeAuthorName,
  isCurrentAuthor,
} from '@databyss-org/services/sources/lib'
import { sortPageEntriesAlphabetically } from '@databyss-org/services/entries/lib'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

import IndexPageContent from '../PageContent/IndexPageContent'

import AuthorIndexEntries from './AuthorIndexEntries'

const buildEntries = (sources, firstName, lastName) => {
  const entries = []
  const values = Object.values(sources)
  values.forEach((value) => {
    const isAuthor = isCurrentAuthor(value.detail?.authors, firstName, lastName)
    if (isAuthor) {
      entries.push(
        createIndexPageEntries({
          id: value._id,
          text: value.text,
        })
      )
    }
  })

  return sortPageEntriesAlphabetically(entries)
}

const AuthorCitations = ({ query }) => {
  const { navigate } = useNavigationContext()

  const params = new URLSearchParams(query)
  const authorQueryFirstName = decodeURIComponent(params.get('firstName'))

  const authorQueryLastName = decodeURIComponent(params.get('lastName'))
  const authorFullName = composeAuthorName(
    authorQueryFirstName,
    authorQueryLastName
  )

  const onEntryClick = (entry) => {
    navigate(`/sources/${entry.id}`)
  }

  return (
    <SourceCitationsLoader>
      {(sources) => {
        const entries = buildEntries(
          sources,
          authorQueryFirstName,
          authorQueryLastName
        )

        return (
          <IndexPageContent title={authorFullName}>
            <Helmet>
              <meta charSet="utf-8" />
              <title>{authorFullName}</title>
            </Helmet>
            <AuthorIndexEntries onClick={onEntryClick} entries={entries} />
          </IndexPageContent>
        )
      }}
    </SourceCitationsLoader>
  )
}

export default AuthorCitations
