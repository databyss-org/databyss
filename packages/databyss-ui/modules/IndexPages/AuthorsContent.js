// TODO: replace this page with a proper index page
import React from 'react'
import { createIndexPageEntries } from '@databyss-org/services/entries/util'
import {
  composeAuthorName,
  isCurrentAuthor,
} from '@databyss-org/services/sources/lib'
import { sortPageEntriesAlphabetically } from '@databyss-org/services/entries/lib'
import { useNavigationContext } from '@databyss-org/ui/components/Navigation/NavigationProvider/NavigationProvider'
import { useBlocksInPages } from '@databyss-org/data/pouchdb/hooks'
import { BlockType } from '@databyss-org/editor/interfaces'
import { LoadingFallback } from '@databyss-org/ui/components'
import { AuthorsResults } from './AuthorsResults'
import { IndexPageView } from './IndexPageContent'

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
  const sourcesRes = useBlocksInPages(BlockType.Source)
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

  if (!sourcesRes.isSuccess) {
    return <LoadingFallback queryObserver={sourcesRes} />
  }

  const entries = buildEntries(
    sourcesRes.data,
    authorQueryFirstName,
    authorQueryLastName
  )

  return (
    <IndexPageView path={['Authors', authorFullName]}>
      <AuthorsResults onClick={onEntryClick} entries={entries} />
    </IndexPageView>
  )
}
