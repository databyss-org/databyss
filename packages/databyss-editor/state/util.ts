import { BlockType } from '@databyss-org/services/interfaces'
import { Selection, Block, Range, EditorState } from '../interfaces'

export const symbolToAtomicType = (symbol: string): BlockType =>
  ({ '@': BlockType.Source, '#': BlockType.Topic }[symbol])

// returns false if selection anchor and focus are equal, otherwise true
export const selectionHasRange = (selection: Selection): boolean =>
  selection &&
  (selection.anchor.index !== selection.focus.index ||
    selection.anchor.offset !== selection.focus.offset)

// shifts the range left `offset`
export const offsetRanges = (ranges: Array<Range>, _offset: number) =>
  ranges.map(r => {
    let length = r.length
    let offset = r.offset
    // if offset is position zero, shift length instead of offset
    if (!offset) {
      length -= 1
    } else {
      offset -= _offset
    }
    return { ...r, length, offset }
  })

export const removeLocationMark = (ranges: Array<Range>) =>
  ranges.filter(r => !r.marks.includes('location'))

// returns a shallow clone of the block so immer.patch isn't confused
export const blockValue = (block: Block): Block => ({ ...block })
