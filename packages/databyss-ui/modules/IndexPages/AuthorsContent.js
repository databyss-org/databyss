// TODO: replace this page with a proper index page
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
import { ScrollView, Text, View, pxUnits } from '@databyss-org/ui/primitives'
import { AuthorsResults } from './AuthorsResults'

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

export const AuthorsContent = ({ query }) => {
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
          <ScrollView p="medium" flex="1">
            <Helmet>
              <meta charSet="utf-8" />
              <title>{authorFullName}</title>
            </Helmet>
            <View py="medium" px={pxUnits(28)}>
              <Text variant="bodyHeading1" color="text.3">
                {authorFullName}
              </Text>
            </View>
            <AuthorsResults onClick={onEntryClick} entries={entries} />
          </ScrollView>
        )
      }}
    </SourceCitationsLoader>
  )
}
