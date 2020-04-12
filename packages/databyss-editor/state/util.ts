import { Entity, Selection } from '../interfaces'

export const entityForBlockIndex = (state: any, blockIndex: number): Entity =>
  state.entityCache[state.blockCache[state.blocks[blockIndex]._id].entityId]

// returns false if selection anchor and focus are equal, otherwise true
export const selectionHasRange = (selection: Selection): boolean =>
  selection &&
  (selection.anchor.index !== selection.focus.index ||
    selection.anchor.offset !== selection.focus.offset)
