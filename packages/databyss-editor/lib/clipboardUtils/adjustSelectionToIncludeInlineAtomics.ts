import cloneDeep from 'clone-deep'
import { Point, Block } from '../../interfaces'
import { getRangesAtPoint } from '../../state/util'

// updates block with selection removed
export default ({
  blocks,
  anchor,
  focus,
}: {
  blocks: Block[]
  anchor: Point
  focus: Point
}): { anchor: Point; focus: Point } => {
  let _anchor = anchor
  let _focus = focus

  // find if the anchor and focus fall within an atomic inline
  const _inlineRangesAtAnchor = getRangesAtPoint({
    blocks,
    point: {
      offset: anchor.offset + 1,
      index: anchor.index,
    },
  }).filter(
    (r) =>
      r.marks.length &&
      r.marks.filter((i) => Array.isArray(i) && i[0] === 'inlineTopic').length
  )
  const _inlineRangesAtFocus = getRangesAtPoint({
    blocks,
    point: focus,
  }).filter(
    (r) =>
      r.marks.length &&
      r.marks.filter((i) => Array.isArray(i) && i[0] === 'inlineTopic').length
  )

  // try catch function works with both read only and non read only properties

  // if anchor falls within an inline range adjust anchor to include the inline atomic
  if (_inlineRangesAtAnchor.length) {
    try {
      _anchor.offset = _inlineRangesAtAnchor[0].offset
    } catch {
      _anchor = cloneDeep(anchor)
      _anchor.offset = _inlineRangesAtAnchor[0].offset
    }
  }

  // if focus falls within an inline range adjust anchor to include the inline atomic
  if (_inlineRangesAtFocus.length) {
    try {
      _focus.offset =
        _inlineRangesAtFocus[0].offset + _inlineRangesAtFocus[0].length
    } catch {
      _focus = cloneDeep(focus)
      _focus.offset =
        _inlineRangesAtFocus[0].offset + _inlineRangesAtFocus[0].length
    }
  }
  return { anchor: _anchor, focus: _focus }
}
