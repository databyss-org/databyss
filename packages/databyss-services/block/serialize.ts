import colors from '@databyss-org/ui/theming/colors'
import { Text } from '../interfaces'

const tags: { [mark: string]: string[] } = {
  bold: ['strong', 'strong'],
  italic: ['i', 'i'],
  highlight: [`span style="background-color: ${colors.orange[3]}"`, 'span'],
  location: [`span style="color: ${colors.gray[4]}"`, 'span'],
}

/**
 * Renders Text as HTML
 * TODO: add support for nested and overlapped ranges
 */
export function textToHtml(text: Text): string {
  let _html = text.textValue.replaceAll('\n', '<br />')
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

  _ranges.forEach(_range => {
    // split text into _before, _segment and _after
    const _before = _html.slice(0, _range.offset)
    const _segment = _html.slice(_range.offset, _range.offset + _range.length)
    const _after = _html.slice(_range.offset + _range.length)
    let _openTags = ''
    let _closeTags = ''
    _range.marks.forEach(_mark => {
      _openTags += `<${tags[_mark][0]}>`
      _closeTags = `</${tags[_mark][1]}>${_closeTags}`
    })
    _html = `${_before}${_openTags}${_segment}${_closeTags}${_after}`
  })
  return _html
}
