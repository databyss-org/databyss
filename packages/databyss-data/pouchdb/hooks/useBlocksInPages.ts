import { BlockType } from '@databyss-org/editor/interfaces'
import { getBlocksFromBlockRelations } from '@databyss-org/services/blocks/joins'
import { Block } from '@databyss-org/services/interfaces'
import { QueryObserverResult, UseQueryOptions } from 'react-query'
import { useBlockRelations, useBlocks, usePages } from '.'

export const useBlocksInPages = <T extends Block>(
  blockType: BlockType,
  options?: UseQueryOptions
): QueryObserverResult<T[]> => {
  const blockRelationsRes = useBlockRelations(blockType, options)
  const blocksRes = useBlocks(blockType, options)
  const pagesRes = usePages(options)

  const incompleteRes = [blockRelationsRes, pagesRes, blocksRes].find(
    (r) => !r.isSuccess
  )
  if (incompleteRes) {
    return incompleteRes as QueryObserverResult<T[]>
  }

  return {
    ...blocksRes,
    data: getBlocksFromBlockRelations(
      blockRelationsRes.data!,
      blocksRes.data!,
      pagesRes.data!,
      false
    ),
  } as QueryObserverResult<T[]>
}
