import { Entity, Selection, Block, Range } from '../interfaces'

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

// shifts the range left `offset`
export const offsetRanges = (ranges: Range, _offset: number) =>
  ranges.map(r => {
    let length = r.length
    let offset = r.offset
    // if offset is position zero, shift length instead of offset
    if (!offset) {
      length = length - 1
    } else {
      offset = offset - _offset
    }
    return { ...r, length, offset }
  })

export const removeLocationMark = (ranges: Range) =>
  ranges.filter(r => !r.marks.includes('location'))
