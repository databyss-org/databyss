import React from 'react'
import { Helmet } from 'react-helmet'

import { createIndexPageEntries } from '@databyss-org/services/entries/util'
import {
  composeAuthorName,
  isCurrentAuthor,
} from '@databyss-org/services/sources/lib'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

import IndexPageContent from '../PageContent/IndexPageContent'

import AuthorIndexEntries from './AuthorIndexEntries'

function sortPageEntriesAlphabetically(entries) {
  // error checks
  if (!entries) {
    throw new Error(
      'sortPageEntriesAlphabetically() expected an array to sort,' +
        'but none was provided'
    )
  }

  // defensive checks
  if (!entries.length) {
    return entries
  }

  // sort
  return entries.sort(
    (a, b) =>
      a.text.textValue.toLowerCase() > b.text.textValue.toLowerCase() ? 1 : -1
  )
}

const AuthorCitations = ({ query }) => {
  const { navigate } = useNavigationContext()

  const params = new URLSearchParams(query)
  const authorQueryFirstName = params.get('firstName')
  const authorQueryLastName = params.get('lastName')
  const authorFullName = composeAuthorName(
    authorQueryFirstName,
    authorQueryLastName
  )

  const onEntryClick = entry => {
    navigate(`/sources/${entry.id}`)
  }

  return (
    <SourceCitationsLoader>
      {sourceCitations => {
        const sourceEntries = []
        const values = Object.values(sourceCitations)
        values.forEach(value => {
          const isAuthor = isCurrentAuthor(
            value.detail?.authors,
            authorQueryFirstName,
            authorQueryLastName
          )
          if (isAuthor) {
            sourceEntries.push(
              createIndexPageEntries({
                id: value._id,
                text: value.text,
              })
            )
          }
        })

        const sortedSourceEntries = sortPageEntriesAlphabetically(sourceEntries)

        return (
          <IndexPageContent title={authorFullName}>
            <Helmet>
              <meta charSet="utf-8" />
              <title>{authorFullName}</title>
            </Helmet>
            <AuthorIndexEntries
              onClick={onEntryClick}
              entries={sortedSourceEntries}
            />
          </IndexPageContent>
        )
      }}
    </SourceCitationsLoader>
  )
}

export default AuthorCitations
