import cloneDeep from 'clone-deep'
import { Range } from '../interfaces/Range'

export enum SortOptions {
  Ascending,
  Descending,
  None,
}

/**
 * Merge marks with identical ranges.
 */
export function mergeRanges(
  ranges: Range[],
  sort: SortOptions = SortOptions.None
) {
  const _rangeDict: { [rangeTuple: string]: Range } = {}
  const _rangeKey = (range: Range) => `[${range.offset}, ${range.length}]`
  ranges.forEach((range) => {
    if (_rangeDict[_rangeKey(range)]) {
      // merge the marks
      _rangeDict[_rangeKey(range)].marks.push(...range.marks)
      return
    }
    _rangeDict[_rangeKey(range)] = cloneDeep(range)
  })
  const _merged: Range[] = Object.values(_rangeDict)

  if (sort === SortOptions.None) {
    return _merged
  }

  return _merged.sort((a, b) => {
    if (a.offset < b.offset) {
      return sort === SortOptions.Descending ? 1 : -1
    }
    if (a.offset > b.offset) {
      return sort === SortOptions.Descending ? -1 : 1
    }
    return 0
  })
}
