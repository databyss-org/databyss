import { Block, BlockType } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'
import { QueryOptions } from '@tanstack/react-query'
import { selectors } from '../selectors'
import { useDocuments } from './useDocuments'

interface UseBlocksOptions extends QueryOptions {
  includeIds?: string[]
}

export const useBlocks = (blockType: BlockType, options?: UseBlocksOptions) => {
  let _selectorOrIds: PouchDB.Find.Selector | string[] = selectors.BLOCKS
  if (options && options.includeIds) {
    _selectorOrIds = [options.includeIds]
  } else {
    _selectorOrIds = {
      [BlockType.Embed]: selectors.EMBEDS,
      [BlockType.Topic]: selectors.TOPICS,
      [BlockType.Source]: selectors.SOURCES,
      [BlockType._ANY]: selectors.BLOCKS,
    }[blockType]
  }
  const query = useDocuments<Block>(_selectorOrIds, options)
  return query
}
