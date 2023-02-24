import { Text, Range } from '../../interfaces'

const emptyText = { textValue: '', ranges: [] }

// returns before and after value for text split at `offset`
export default ({
  text,
  offset,
}: {
  text: Text
  offset: number
}): {
  before: Text
  after: Text
} => {
  if (!text?.textValue) {
    return { before: emptyText, after: emptyText }
  }
  // if offset is at start of text, return text value
  if (offset === 0) {
    return { before: emptyText, after: text }
  }

  if (offset === text.textValue.length) {
    return { before: text, after: emptyText }
  }

  let rangesForBlockBefore: Range[] = []
  let rangesForBlockAfter: Range[] = []

  text.ranges.forEach((r: Range) => {
    // range is after split offset
    //
    // |----------S--------------|
    //              ######
    //
    if (r.offset >= offset) {
      rangesForBlockAfter.push({ ...r, offset: r.offset - offset })
    }
    // range is before split offset
    //
    // |----------S--------------|
    //    ######
    //
    if (r.offset + r.length <= offset) {
      rangesForBlockBefore.push(r)
    }
    // range spans split offset, split into 2 ranges and distribute
    //
    // |----------S--------------|
    //         ### ###
    //
    if (r.offset < offset && r.offset + r.length > offset) {
      const beforeLength = offset - r.offset
      rangesForBlockBefore.push({ ...r, length: beforeLength })
      rangesForBlockAfter.push({
        ...r,
        offset: 0,
        length: r.length - beforeLength,
      })
    }
  })

  rangesForBlockBefore = rangesForBlockBefore.filter((r) => r.length > 0)

  rangesForBlockAfter = rangesForBlockAfter.filter((r) => r.length > 0)

  return {
    before: {
      textValue: text.textValue.substring(0, offset),
      ranges: rangesForBlockBefore,
    },

    after: {
      textValue: text.textValue.substring(offset),
      ranges: rangesForBlockAfter,
    },
  }
}
