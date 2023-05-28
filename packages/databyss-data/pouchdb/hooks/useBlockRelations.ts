import { BlockType, BlockRelation } from '@databyss-org/services/interfaces'
import { UseQueryOptions } from '@tanstack/react-query'
import { selectors } from '../selectors'
import { useDocuments } from './useDocuments'

export const useBlockRelations = (
  blockType: BlockType,
  options?: UseQueryOptions
) => {
  const _selector = {
    [BlockType.Embed]: selectors.EMBED_RELATIONS,
    [BlockType.Topic]: selectors.TOPIC_RELATIONS,
    [BlockType.Source]: selectors.SOURCE_RELATIONS,
    [BlockType.Link]: selectors.LINK_RELATIONS,
  }[blockType]
  const query = useDocuments<BlockRelation>(_selector, options)
  return query
}
