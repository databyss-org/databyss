import colors from '@databyss-org/ui/theming/colors'
import { Text } from '../interfaces'
import { RangeType, InlineTypes } from '../interfaces/Range'

const tags: { [mark: string]: string[] } = {
  [RangeType.Bold]: ['strong', 'strong'],
  [RangeType.Italic]: ['i', 'i'],
  [RangeType.Highlight]: [
    `span style="background-color: ${colors.orange[3]}"`,
    'span',
  ],
  [RangeType.Location]: [`span style="color: ${colors.gray[4]}"`, 'span'],
  [InlineTypes.InlineTopic]: [`span style="color: ${colors.red[1]}"`, 'span'],
}

/**
 * Renders Text as HTML
 * TODO: add support for nested and overlapped ranges
 */
export function textToHtml(text: Text): string {
  let _html = text.textValue

  if (!text.ranges.length) {
    return _html.replaceAll('\n', '<br />')
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
    const _segment = _html.slice(_range.offset, _range.offset + _range.length)
    const _after = _html.slice(_range.offset + _range.length)

    // ignore marks with no defined markup
    try {
      let _openTags = ''
      let _closeTags = ''
      _range.marks.forEach((_mark) => {
        // mark can also be a tuple, in that case, get first value as the mark

        let __mark: any = _mark
        if (Array.isArray(_mark)) {
          __mark = _mark[0]
        }

        _openTags += `<${tags[__mark][0]}>`
        _closeTags = `</${tags[__mark][1]}>${_closeTags}`
      })
      _html = `${_before}${_openTags}${_segment}${_closeTags}${_after}`
    } catch (err) {
      _html = `${_before}${_segment}${_after}`
    }
  })
  return _html.replaceAll('\n', '<br />')
}
