import { BlockType } from '@databyss-org/editor/interfaces'
import { getBlocksFromBlockRelations } from '@databyss-org/services/blocks/joins'
import { Block } from '@databyss-org/services/interfaces'
import {
  QueryObserverResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import { useBlockRelations, useBlocks, usePages } from '.'
import { UseDocumentOptions } from './useDocument'
import { useEffect, useRef } from 'react'

export const useBlocksInPages = <T extends Block>(
  blockType: BlockType,
  options?: UseDocumentOptions
) => {
  const prevQuery = useRef<UseQueryResult | null>(null)
  const blockRelationsRes = useBlockRelations(blockType, options)
  const blocksRes = useBlocks(blockType, options)
  const pagesRes = usePages(options)

  const queryKey = [
    `blocksInPages_${blockType}`,
    blockRelationsRes.dataUpdatedAt,
    blocksRes.dataUpdatedAt,
    pagesRes.dataUpdatedAt,
  ]
  const query = useQuery<T[]>({
    queryFn: () =>
      // console.log('[useBlocksInPages] query', queryKey)
      getBlocksFromBlockRelations(
        blockRelationsRes.data!,
        blocksRes.data!,
        pagesRes.data!,
        false
      ),
    enabled:
      blockRelationsRes.isSuccess && blocksRes.isSuccess && pagesRes.isSuccess,
    ...(options as UseQueryOptions<T[]>),
    queryKey,
  })

  useEffect(() => {
    prevQuery.current = null
  }, [options?.previousDeps])

  if (!query.data && options?.previousIfNull && prevQuery.current) {
    return prevQuery.current
  }

  prevQuery.current = query

  return query
}
