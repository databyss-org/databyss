import { BlockType } from '@databyss-org/editor/interfaces'
import { getBlocksInPages } from '@databyss-org/services/blocks/joins'
import { useBlockRelations, useBlocks, usePages } from '.'

export const useBlocksInPages = (blockType: BlockType) => {
  const blockRelationsRes = useBlockRelations(blockType)
  const pagesRes = usePages()
  const blocksRes = useBlocks(blockType)

  const incompleteRes = [blockRelationsRes, pagesRes, blocksRes].find(
    (r) => !r.isSuccess
  )
  if (incompleteRes) {
    return incompleteRes
  }

  return {
    ...blocksRes,
    data: getBlocksInPages(
      blockRelationsRes.data!,
      blocksRes.data!,
      pagesRes.data!,
      false
    ),
  }
}
