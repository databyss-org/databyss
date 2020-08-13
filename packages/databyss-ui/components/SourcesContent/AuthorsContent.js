import React from 'react'
import {
  sortEntriesAtoZ,
  createIndexPageEntries,
} from '@databyss-org/services/entries/util'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import {
  AuthorsLoader,
  SourceCitationsLoader,
} from '@databyss-org/ui/components/Loaders'
import AuthorSvg from '@databyss-org/ui/assets/author.svg'
import IndexPageEntries from '../PageContent/IndexPageEntries'
import IndexPageContent from '../PageContent/IndexPageContent'

const AuthorsContent = () => {
  const { navigate } = useNavigationContext()

  return (
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
                name: value,
              })
            })
            const sortedAuthors = sortEntriesAtoZ(authorData, 'text')

            const onAuthorClick = i => {
              const _url = `firstName=${
                i.name.firstName ? i.name.firstName.textValue : ''
              }&lastName=${i.name.lastName ? i.name.lastName.textValue : ''}`
              navigate(`/sources?${_url}`)
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
}

export default AuthorsContent
