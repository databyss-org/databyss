import React, { useEffect } from 'react'
import { BlockType, Source } from '@databyss-org/services/interfaces'
import {
  useBlockRelations,
  useBlocks,
  usePages,
  useAuthors,
} from '@databyss-org/data/pouchdb/hooks'
import {
  LoadingFallback,
  SidebarList,
  SidebarListItemData,
} from '@databyss-org/ui/components'
import { getBlocksFromBlockRelations } from '@databyss-org/services/blocks/joins'
import { upsertAuthor, authorToId } from '@databyss-org/data/pouchdb/utils'
import { useQueryClient } from '@tanstack/react-query'
import {
  mapAuthorData,
  authorsFromSources,
  AuthorWithStats,
} from '../transforms/authorsToListItemData'

interface AuthorListProps {
  prependItems?: SidebarListItemData<any>[]
  heading?: string
}

export const AuthorList = ({
  prependItems,
  heading,
  ...others
}: AuthorListProps) => {
  const blockRelationsRes = useBlockRelations(BlockType.Source)
  const blocksRes = useBlocks(BlockType.Source)
  const pagesRes = usePages()
  const authorsRes = useAuthors()
  const queryClient = useQueryClient()

  const queryRes = [blockRelationsRes, blocksRes, pagesRes, authorsRes]

  const sources = queryRes.every((q) => q.isSuccess)
    ? (getBlocksFromBlockRelations(
        blockRelationsRes.data!,
        blocksRes.data!,
        pagesRes.data!,
        false
      ) as Source[])
    : null

  // Derive the aggregated author list from sources
  const authorsFromSourcesDict = sources ? authorsFromSources(sources) : null

  // Upsert any authors not yet in the authors collection
  useEffect(() => {
    if (!authorsFromSourcesDict) return
    Object.values(authorsFromSourcesDict).forEach((author) => {
      upsertAuthor(author, queryClient)
    })
  }, [
    JSON.stringify(
      authorsFromSourcesDict && Object.keys(authorsFromSourcesDict)
    ),
  ])

  if (queryRes.some((q) => !q.isSuccess)) {
    return <LoadingFallback queryObserver={queryRes} />
  }

  // Inner join: only authors that exist in both collections
  const mergedAuthors: AuthorWithStats[] = Object.values(
    authorsFromSourcesDict!
  ).map((authorFromSource) => {
    const _id = authorToId(authorFromSource)
    const authorDoc = authorsRes.data![_id]
    return {
      ...authorFromSource,
      // prefer the accessedAt from the author doc (updated when author page is viewed)
      accessedAt: authorDoc?.accessedAt ?? authorFromSource.accessedAt,
    }
  })

  const mapped = mapAuthorData(mergedAuthors)

  return (
    <SidebarList
      menuItems={mapped}
      prependItems={prependItems}
      heading={heading}
      {...others}
    />
  )
}
