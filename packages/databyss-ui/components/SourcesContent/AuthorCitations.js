import React from 'react'
import { useParams } from '@reach/router'
import { sortEntriesAtoZ } from '@databyss-org/services/sources/util'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import IndexPageContent from '../PageContent/IndexPageContent'
import IndexPageEntries from '../PageContent/IndexPageEntries'

const AuthorCitations = () => {
  const { query } = useParams()
  const params = new URLSearchParams(query)
  const authorQueryFirstName = params.get('author_first')
  const authorQueryLastName = params.get('author_last')

  const composeAuthorName = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${lastName}, ${firstName}`
    }
    return lastName || firstName
  }

  return (
    <SourceCitationsLoader>
      {sourceCitations => {
        const authorCitationsData = Object.values(sourceCitations).map(
          value => {
            const authorFirstName = value.author?.firstName?.textValue
            const authorLastName = value.author?.lastName?.textValue

            if (
              authorFirstName === authorQueryFirstName &&
              authorLastName === authorQueryLastName
            ) {
              return {
                text: value.text,
                citations: value.citations?.map(
                  citation => citation.text?.textValue
                ),
                type: 'authors',
              }
            }
            return {}
          }
        )

        const sortedAuthorCitations = sortEntriesAtoZ(
          authorCitationsData,
          'text'
        )

        return (
          <IndexPageContent
            title={composeAuthorName(authorQueryFirstName, authorQueryLastName)}
          >
            <IndexPageEntries entries={sortedAuthorCitations} />
          </IndexPageContent>
        )
      }}
    </SourceCitationsLoader>
  )
}

export default AuthorCitations
