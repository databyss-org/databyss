import { Entity, Selection, Block } from '../interfaces'

export const symbolToAtomicType = (symbol: string): string =>
  ({ '@': 'SOURCE', '#': 'TOPIC' }[symbol])

export const blockAtIndex = (state: any, blockIndex: number): Block | null => {
  const _block = state.blocks[blockIndex]
  if (!_block) {
    return null
  }
  return state.blockCache[_block._id]
}

export const entityForBlockIndex = (
  state: any,
  blockIndex: number
): Entity | null => {
  const _block = blockAtIndex(state, blockIndex)
  if (!_block) {
    return null
  }
  return state.entityCache[_block.entityId]
}

// returns false if selection anchor and focus are equal, otherwise true
export const selectionHasRange = (selection: Selection): boolean =>
  selection &&
  (selection.anchor.index !== selection.focus.index ||
    selection.anchor.offset !== selection.focus.offset)

// returns a list of indecies indicationg where ref values exsit
export const getIndeciesForRefId = (state: any, refId: string) => {
  const { blockCache, blocks } = state
  const matches = []
  Object.keys(blockCache).forEach(id => {
    if (blockCache[id].entityId === refId) {
      matches.push(blocks.findIndex(b => b._id === id))
    }
  })

  return matches
}

export const offsetRanges = (ranges: any, offset: any) =>
  ranges.map(r => ({ ...r, offset: r.offset - 1 }))

export const removeLocationMark = (ranges: any) =>
  ranges.filter(r => !r.marks.includes('location'))
