import { InlineRangeType, Mark, Range } from '@databyss-org/services/interfaces'

interface MarkDict {
  [mark: string]: boolean | InlineRangeType
}

export function flattenRanges(ranges: Range[]) {
  // each position in marks holds 0 or more marks
  const marks: MarkDict[] = []

  // find extent of ranges
  let _length = 0
  ranges.forEach((range, rangeIdx) => {
    // iterate over possible mark positions
    for (let idx = range.offset; idx < range.offset + range.length; idx += 1) {
      if (!marks[idx]) {
        marks[idx] = {}
      }
      range.marks.forEach((mark) => {
        if (Array.isArray(mark)) {
          marks[idx][rangeIdx] = mark
        } else {
          marks[idx][mark] = true
        }
      })
    }
    _length = Math.max(range.offset + range.length, _length)
  })

  // iterate over all mark positions and generate new ranges
  const flat: Range[] = []
  let currentMarks: string = ''
  let currentRange: Range | null = null
  for (let idx = 0; idx < _length; idx += 1) {
    if (!marks[idx]) {
      currentMarks = ''
      continue
    }
    const _marks = Object.keys(marks[idx]).sort().join(',')
    if (_marks !== currentMarks) {
      currentRange = {
        offset: idx,
        length: 1,
        marks: Object.keys(marks[idx])
          .map(
            (key) =>
              (typeof marks[idx][key] === 'boolean'
                ? key
                : marks[idx][key]) as Mark
          )
          .sort(),
      }
      currentMarks = _marks
      flat.push(currentRange)
    } else {
      currentRange!.length += 1
    }
  }

  return flat
}
