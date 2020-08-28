import React from 'react'
import {
  sortEntriesAtoZ,
  createIndexPageEntries,
} from '@databyss-org/services/entries/util'
import { useSessionContext } from '@databyss-org/services/session/SessionProvider'
import { SourceCitationsLoader } from '@databyss-org/ui/components/Loaders'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import SourceSvg from '@databyss-org/ui/assets/source.svg'
import IndexPageContent from '../PageContent/IndexPageContent'
import IndexPageEntries from '../PageContent/IndexPageEntries'

const AuthorCitations = ({ query }) => {
  const { navigate } = useNavigationContext()
  const { getCurrentAccount } = useSessionContext()
  const { firstName, lastName } = query

  const authorQueryFirstName = firstName
  const authorQueryLastName = lastName

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
                id: value._id,
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

        const onCitationClick = c => {
          navigate(`/sources/${c.id}`)
        }

        return (
          <IndexPageContent
            title={composeAuthorName(authorQueryFirstName, authorQueryLastName)}
          >
            <IndexPageEntries
              onClick={onCitationClick}
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
