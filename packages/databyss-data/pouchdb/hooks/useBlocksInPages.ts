import { BlockType } from '@databyss-org/editor/interfaces'
import { getBlocksFromBlockRelations } from '@databyss-org/services/blocks/joins'
import { Block } from '@databyss-org/services/interfaces'
import { QueryObserverResult } from 'react-query'
import { useBlockRelations, useBlocks, usePages } from '.'

export const useBlocksInPages = <T extends Block>(
  blockType: BlockType
): QueryObserverResult<T[]> => {
  const blockRelationsRes = useBlockRelations(blockType)
  const blocksRes = useBlocks(blockType)
  const pagesRes = usePages()

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
