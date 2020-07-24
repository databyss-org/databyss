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
            const firstName = value.firstName?.textValue
            const lastName = value.lastName?.textValue
            return createIndexPageEntries({
              text: `${lastName}${firstName && `, ${firstName}`}`,
              type: 'authors',
            })
          })
          const sortedAuthors = sortEntriesAtoZ(authorData, 'text')

          return (
            <IndexPageContent title="All Authors">
              <IndexPageEntries entries={sortedAuthors} icon={<AuthorSvg />} />
            </IndexPageContent>
          )
        }}
      </AuthorsLoader>
    )}
  </SourceCitationsLoader>
)

export default AuthorsContent
