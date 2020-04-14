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
