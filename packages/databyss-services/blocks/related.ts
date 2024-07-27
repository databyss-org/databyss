import { Block, BlockReference, BlockType } from '../interfaces'
import { InlineTypes } from '../interfaces/Range'
import { validURL } from '../lib/util'

export const isAtomicInlineType = (type: BlockType) => {
  switch (type) {
    case BlockType.Source:
      return true
    case BlockType.Topic:
      return true
    case BlockType.EndTopic:
      return true
    case BlockType.EndSource:
      return true
    case BlockType.Embed:
      return true
    default:
      return false
  }
}

export const getInlineAtomicType = (
  type: InlineTypes | string
): BlockType | null => {
  switch (type) {
    case InlineTypes.InlineTopic:
      return BlockType.Topic
    case InlineTypes.InlineSource:
      return BlockType.Source
    case InlineTypes.Embed:
      return BlockType.Embed
    default:
      return null
  }
}

export const getAtomicsFromFrag = (
  frag: Block[],
  includeDuplicates?: boolean
): BlockReference[] => {
  const atomics: BlockReference[] = []
  frag.forEach((b) => {
    if (!isAtomicInlineType(b.type)) {
      b.text.ranges.forEach((r) => {
        if (r.marks.length) {
          r.marks
            .filter(
              (i) =>
                Array.isArray(i) &&
                (i[0] === InlineTypes.InlineTopic ||
                  i[0] === InlineTypes.InlineSource ||
                  i[0] === InlineTypes.Link ||
                  i[0] === InlineTypes.Embed)
            )
            .forEach((i) => {
              if (includeDuplicates || !atomics.some((a) => a._id === i[1])) {
                // inline page link
                if (i[0] === InlineTypes.Link && !validURL(i[1])) {
                  atomics.push({ type: BlockType.Link, _id: i[1] })
                }
                const atomicType = getInlineAtomicType(i[0])
                if (atomicType) {
                  const _inline: BlockReference = {
                    type: atomicType,
                    _id: i[1],
                  }
                  atomics.push(_inline)
                }
              }
            })
        }
      })
    } else if (
      (includeDuplicates || !atomics.some((a) => a._id === b._id)) &&
      b.text?.textValue.charAt(0) !== '/'
    ) {
      const _atomic = { type: b.type, _id: b._id }
      atomics.push(_atomic)
    }
  })
  return atomics
}
