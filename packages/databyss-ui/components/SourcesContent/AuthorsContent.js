import React from 'react'
import {
  sortEntriesAtoZ,
  createIndexPageEntries,
} from '@databyss-org/services/entries/util'
import {
  AuthorsLoader,
  SourceCitationsLoader,
} from '@databyss-org/ui/components/Loaders'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

const AuthorsContent = () => (
  <SourceCitationsLoader>
    {() => (
      <AuthorsLoader>
        {authors => {
          const authorData = Object.values(authors).map(value => {
            const getAuthorName = () => {
              const firstName = value.firstName?.textValue
              const lastName = value.lastName?.textValue
              if (lastName && firstName) {
                return `${lastName}, ${firstName}`
              }
              return lastName || firstName
            }

            return createIndexPageEntries({
              text: getAuthorName(),
              type: 'authors',
            })
          })
          const sortedAuthors = sortEntriesAtoZ(authorData, 'text')

          const onAuthorClick = i => {
            console.log('CLICKED', i)
          }

          return (
            <IndexPageContent title="All Authors">
              <IndexPageEntries
                onClick={onAuthorClick}
                entries={sortedAuthors}
                icon={<AuthorSvg />}
              />
            </IndexPageContent>
          )
        }}
      </AuthorsLoader>
    )}
  </SourceCitationsLoader>
)

export default AuthorsContent
