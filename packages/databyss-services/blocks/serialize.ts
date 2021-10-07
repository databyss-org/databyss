import 'core-js/features/string/replace-all'
import colors from '@databyss-org/ui/theming/colors'
import { Block, BlockType, Text } from '../interfaces'
import { RangeType, InlineTypes } from '../interfaces/Range'

export interface StringTransformFn {
  (t: string): string
}

export interface TagMapFnType {
  (mark: string[]): (string | StringTransformFn)[]
}

const markToHtml: TagMapFnType = (mark) =>
  ({
    [RangeType.Bold]: ['<strong>', '</strong>'],
    [RangeType.Italic]: ['<i>', '</i>'],
    [RangeType.Highlight]: [
      `<span style="background-color: ${colors.orange[3]}">`,
      '</span>',
    ],
    [RangeType.Location]: [
      `<span style="color: ${colors.gray[4]}">`,
      '</span>',
    ],
    [InlineTypes.InlineTopic]: [
      `<span style="color: ${colors.inlineTopic}">`,
      '</span>',
    ],
    [InlineTypes.InlineSource]: [
      `<span style="color: ${colors.inlineSource}">`,
      '</span>',
    ],
  }[mark[0]] ?? ['', ''])

const markToMarkdown: TagMapFnType = (mark) =>
  ({
    [RangeType.Bold]: ['**', '**'],
    [RangeType.Italic]: ['_', '_'],
    [RangeType.Location]: [`<span style="color:gray">`, '</span>'],
    [InlineTypes.Link]: ['[', `](${mark[1]})`],
    [InlineTypes.InlineSource]: [
      '[[s/',
      ']]',
      ((_t: string) => _t.substr(1)) as StringTransformFn,
    ],
    [InlineTypes.InlineTopic]: [
      '[[t/',
      ']]',
      ((_t: string) => _t.substr(1)) as StringTransformFn,
    ],
  }[mark[0]] ?? ['', ''])

/**
 * Renders Text as HTML
 */
export function textToHtml(text: Text): string {
  return renderText(text, markToHtml).replaceAll('\n', '<br />')
}

/**
 * Renders Text as Markdown
 */
export function textToMarkdown(text: Text): string {
  return renderText(text, markToMarkdown)
}

/**
 * Renders Text as markup/markdown
 */
export function renderText(text: Text, tagMapFn: TagMapFnType): string {
  let _html = text.textValue

  if (!text.ranges.length) {
    return _html
  }

  // sort ranges by offset, descending
  const _ranges = text.ranges.sort((a, b) => {
    if (a.offset < b.offset) {
      return 1
    }
    if (a.offset > b.offset) {
      return -1
    }
    return 0
  })

  _ranges.forEach((_range) => {
    // split text into _before, _segment and _after
    const _before = _html.slice(0, _range.offset)
    let _segment = _html.slice(_range.offset, _range.offset + _range.length)
    const _after = _html.slice(_range.offset + _range.length)

    // EDGE CASE: if segment is just whitespace an has marks, just return the whitespace
    if (!_segment.match(/[^\s]/)) {
      _html = `${_before}${_segment}${_after}`
      return
    }

    // ignore marks with no defined markup
    try {
      let _openTags = ''
      let _closeTags = ''
      _range.marks.forEach((_mark) => {
        // mark can be a tuple or string; coerce to tuple
        const __mark: string[] = Array.isArray(_mark) ? _mark : [_mark]
        const [__open, __close, __transform] = tagMapFn(__mark)
        _openTags += __open
        _closeTags = `${__close}${_closeTags}`
        if (__transform) {
          _segment = (__transform as StringTransformFn)(_segment)
        }
      })
      _html = `${_before}${_openTags}${_segment}${_closeTags}${_after}`
    } catch (err) {
      _html = `${_before}${_segment}${_after}`
    }
  })
  return _html
}
