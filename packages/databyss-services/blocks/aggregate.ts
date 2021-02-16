import { IndexPageResult } from '../interfaces'

export const groupBlockRelationsByPage = (
  blockRelations: IndexPageResult[]
): {
  [pageId: string]: IndexPageResult[]
} => {
  const _relations = [...blockRelations]
  // sort according to block index
  _relations.sort((a, b) => (a.blockIndex > b.blockIndex ? 1 : -1))

  return _relations.reduce((acc, curr) => {
    if (!acc[curr.page]) {
      // init result
      acc[curr.page] = []
    }
    const _entries = acc[curr.page]
    _entries.push(curr)
    // sort the entries by page index value
    _entries.sort((a, b) => (a.blockIndex > b.blockIndex ? 1 : -1))

    acc[curr.page] = _entries
    return acc
  }, {})
}

export const groupBlockRelationsByRelatedBlock = (
  blockRelations: IndexPageResult[]
): { [relatedBlockId: string]: IndexPageResult[] } =>
  blockRelations.reduce((_grouped, _relation) => {
    if (!_grouped[_relation.relatedBlock]) {
      _grouped[_relation.relatedBlock] = []
    }
    _grouped[_relation.relatedBlock].push(_relation)
    return _grouped
  }, {})
