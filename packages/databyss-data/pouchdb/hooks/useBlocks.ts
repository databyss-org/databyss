import { Block, BlockType } from '@databyss-org/services/interfaces'
import PouchDB from 'pouchdb'
import { QueryOptions } from 'react-query'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

interface UseBlocksOptions extends QueryOptions {
  includeIds?: string[]
  enabled?: boolean
}

export const useBlocks = (blockType: BlockType, options?: UseBlocksOptions) => {
  let _selectorOrIds: PouchDB.Find.Selector | string[] = {
    doctype: DocumentType.Block,
  }
  if (blockType !== BlockType._ANY) {
    _selectorOrIds.type = blockType
  }
  if (options && options.includeIds) {
    _selectorOrIds = [options.includeIds]
  }
  const query = useDocuments<Block>(_selectorOrIds, options)
  return query
}
