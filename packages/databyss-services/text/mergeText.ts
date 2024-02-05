import { Range, Text } from '../interfaces'

export const mergeText = (a: Text, b: Text): Text => {
  const mergedTextValue = (a?.textValue ?? '') + (b?.textValue ?? '')

  const mergedRanges = [
    ...(a?.ranges || []),
    ...(b?.ranges || []).map((r: Range) => ({
      ...r,
      offset: r.offset + (a?.textValue?.length ?? 0),
    })),
  ].filter((r) => r.length > 0)

  const mergedText = {
    textValue: mergedTextValue,
    ranges: mergedRanges,
  }

  return mergedText
}
