import { Block, Range } from '../../interfaces'

/*
this function assumes there are two ranges 'inlineAtomicInput` which are adjacent and must be merged
*/
export default ({ block }: { block: Block }) => {
  // get ranges for inlineAtomicInput and sorted by ascending
  const _ranges = block.text.ranges
    .filter(r => r.marks.includes('inlineAtomicInput'))
    .sort((a, b) => {
      if (a.offset > b.offset) {
        return 1
      }
      if (a.offset < b.offset) {
        return -1
      }
      return 0
    })

  // accumulate range on first value of array
  _ranges.reduce((acc: Range[], curr: Range) => {
    if (!acc.length) {
      acc.push(curr)
      return acc
    }
    const _nextOffset = acc[0].offset + acc[0].length
    if (curr.offset === _nextOffset) {
      acc[0].length += curr.length
    }
    return acc
  }, [])

  // remove second value in array
  _ranges.pop()
  const _newRanges = block.text.ranges.filter(
    r => !r.marks.includes('inlineAtomicInput')
  )
  // assign merged values
  _newRanges.push(_ranges[0])
  block.text.ranges = _newRanges
}
