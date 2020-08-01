import React from 'react'
import { useParams } from '@reach/router'
import {
  sortEntriesAtoZ,
  createIndexPageEntries,
} from '@databyss-org/services/entries/util'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
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
            const isCurrentAuthor = value.detail?.authors?.some(author => {
              const firstName = author.firstName?.textValue
              const lastName = author.lastName?.textValue
              // If firstName or LastName is missing, only check the one defined
              if (firstName === undefined && lastName) {
                return lastName === authorQueryLastName
              }
              if (lastName === undefined && firstName) {
                return firstName === authorQueryFirstName
              }

              return (
                firstName === authorQueryFirstName &&
                lastName === authorQueryLastName
              )
            })

            if (isCurrentAuthor) {
              return createIndexPageEntries({
                text: value.text.textValue,
                citations: value.detail?.citations?.map(
                  citation => citation.text?.textValue
                ),
                type: 'sources',
              })
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
            <IndexPageEntries
              entries={sortedAuthorCitations}
              icon={<SourceSvg />}
            />
          </IndexPageContent>
        )
      }}
    </SourceCitationsLoader>
  )
}

export default AuthorCitations
