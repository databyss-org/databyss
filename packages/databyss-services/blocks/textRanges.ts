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

  sortRanges(_merged, sort)

  return _merged
}

export function sortRanges(ranges: Range[], sortOptions: SortOptions) {
  if (!ranges.length || sortOptions === SortOptions.None) {
    return
  }
  ranges.sort((a, b) => {
    if (a.offset < b.offset) {
      return sortOptions === SortOptions.Descending ? 1 : -1
    }
    if (a.offset > b.offset) {
      return sortOptions === SortOptions.Descending ? -1 : 1
    }
    // if offsets are the same, put the shorter one first
    if (a.length < b.length) {
      return sortOptions === SortOptions.Descending ? 1 : -1
    }
    if (a.length > b.length) {
      return sortOptions === SortOptions.Descending ? -1 : 1
    }
    return 0
  })
}

/**
 * Split overlapping ranges into new ranges with merged marks
 */
export function splitOverlappingRanges(ranges: Range[]) {
  if (!ranges.length) {
    return
  }
  sortRanges(ranges, SortOptions.Ascending)
  const _overlapRanges: Range[] = []
  ranges.forEach((_range, _idx) => {
    const _nextRange = _idx < ranges.length - 1 ? ranges[_idx + 1] : null
    const _nextOffset = _nextRange?.offset!
    if (_nextRange && _range.offset + _range.length > _nextOffset) {
      // create new range for overlap
      const _overlapRange: Range = {
        offset: _nextOffset,
        length: Math.min(
          _range.offset + _range.length - _nextOffset,
          _nextRange.length
        ),
        marks: [..._nextRange.marks, ..._range.marks],
      }
      // edge case: range.offset and nextRange.offset are both at 0,
      // so we need to make current range the overlap range
      if (_range.offset === 0 && _range.offset === _nextOffset) {
        _range.marks = _overlapRange.marks
        _nextRange.offset = _range.length
        return
      }

      // otherwise just push the overlap range
      _overlapRanges.push(_overlapRange)

      // if range extends over entire nextRange, make nextRange the latter-half of range
      if (_range.offset + _range.length > _nextOffset + _nextRange.length) {
        _nextRange.offset = _overlapRange.offset + _overlapRange.length
        _nextRange.length =
          _range.length -
          _overlapRange.length -
          (_overlapRange.offset - _range.offset)
        _nextRange.marks = _range.marks
      } else {
        // move next offset to end of overlap range
        _nextRange.offset = _overlapRange.offset + _overlapRange.length
        // reduce length of next range by length of overlap
        _nextRange.length -= _overlapRange.length
      }
      // truncate current range at start of next offset
      _range.length = _nextOffset - _range.offset
    }
  })
  ranges.push(..._overlapRanges)
  sortRanges(ranges, SortOptions.Ascending)
}
