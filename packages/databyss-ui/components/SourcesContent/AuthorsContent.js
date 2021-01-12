import React from 'react'
import { Helmet } from 'react-helmet'

import {
  AuthorsLoader,
  SourceCitationsLoader,
} from '@databyss-org/ui/components/Loaders'
import { composeAuthorName } from '@databyss-org/services/sources/lib'
import { createIndexPageEntries } from '@databyss-org/services/entries/util'
import { sortPageEntriesAlphabetically } from '@databyss-org/services/entries/lib'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'

import AuthorIndexEntries from './AuthorIndexEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

const buildEntries = (authors) => {
  const entries = Object.values(authors).map((value) =>
    createIndexPageEntries({
      text: {
        textValue: composeAuthorName(
          value.firstName?.textValue,
          value.lastName?.textValue
        ),
        ranges: [],
      },
      type: 'authors',
      name: value,
    })
  )

  return sortPageEntriesAlphabetically(entries)
}

const AuthorsContent = () => {
  const { navigate } = useNavigationContext()

  const onEntryClick = (entry) => {
    const firstName = entry.name.firstName ? entry.name.firstName.textValue : ''
    const lastName = entry.name.lastName ? entry.name.lastName.textValue : ''
    navigate(`/sources?firstName=${firstName}&lastName=${lastName}`)
  }

  return (
    <SourceCitationsLoader>
      {() => (
        <AuthorsLoader filtered>
          {(authors) => {
            const entries = buildEntries(authors)

            return (
              <IndexPageContent title="All Authors" indexName="Authors">
                <Helmet>
                  <meta charSet="utf-8" />
                  <title>All Authors</title>
                </Helmet>
                <AuthorIndexEntries onClick={onEntryClick} entries={entries} />
              </IndexPageContent>
            )
          }}
        </AuthorsLoader>
      )}
    </SourceCitationsLoader>
  )
}

export default AuthorsContent
