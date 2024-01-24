import 'core-js/features/string/replace-all'
import defaultColors from '@databyss-org/ui/theming/colors'
import { Document, DocumentDict, Embed, Page, Text } from '../interfaces'
import { RangeType, InlineTypes } from '../interfaces/Range'
import { validUriRegex } from '../lib/util'
import { cleanFilename, escapeReserved } from '../markdown'

export interface StringTransformFn {
  (t: string): string
}

export interface TagMapFnType {
  ({ mark, linkedDocs, colors }: { 
    mark: string[]
    linkedDocs: DocumentDict<Document> 
    colors?: any
  }): (
    | string
    | StringTransformFn
  )[]
}

const markToHtml: TagMapFnType = ({ mark, colors }) =>
  ({
    [RangeType.Bold]: ['<strong>', '</strong>'],
    [RangeType.Italic]: ['<i>', '</i>'],
    [RangeType.Highlight]: [
      `<span style="background-color: ${(colors ?? defaultColors).highlight[0]}" data-find-highlight="true">`,
      '</span>',
    ],
    [RangeType.Location]: [
      `<span style="color: ${(colors ?? defaultColors).gray[4]}">`,
      '</span>',
    ],
    [InlineTypes.InlineTopic]: [
      `<span style="color: ${(colors ?? defaultColors).inlineTopic}">`,
      '</span>',
    ],
    [InlineTypes.InlineSource]: [
      `<span style="color: ${(colors ?? defaultColors).inlineSource}">`,
      '</span>',
    ],
  }[mark[0]] ?? ['', ''])

const markToMarkdown: TagMapFnType = ({ mark, linkedDocs }) => {
  const _c = cleanFilename
  switch (mark[0]) {
    case RangeType.Bold:
      return ['**', '**']
    case RangeType.Italic:
      return ['_', '_']
    case RangeType.Location:
      return [
        '[*',
        (_t: string) => (_t.endsWith(' ') ? '*] ' : '*]'),
        (_t: string) => _t.trim(),
      ]
    case InlineTypes.Link:
      if (mark[1].match(validUriRegex)) {
        return ['[', `](${mark[1]})`]
      }
      const _pageName = (linkedDocs[mark[1]] as Page).name
      return [
        '[[',
        `]]`,
        (_t: string) => (_t === _pageName ? _c(_t) : `${_c(_pageName)}|${_t}`),
      ]
    case InlineTypes.InlineSource:
      return [
        '[[s/',
        ']]',
        ((_t: string) => _c(_t.substr(1))) as StringTransformFn,
      ]
    case InlineTypes.InlineTopic:
      return [
        '[[t/',
        ']]',
        ((_t: string) => _c(_t.substr(1))) as StringTransformFn,
      ]
    case InlineTypes.Embed:
      const trimCurlies =
        // remove leading and trailing curlies
        (_t: string) => _t.replaceAll(/^{/g, '').replaceAll(/}$/g, '')
      const _embedBlock = linkedDocs[mark[1]] as Embed
      if (_embedBlock.detail.openGraphJson) {
        const _og = JSON.parse(_embedBlock.detail.openGraphJson)
        if (_og.ogImage?.url) {
          return [
            '[![',
            `](${_og.ogImage.url})](${_embedBlock.detail.src})`,
            trimCurlies,
          ]
        }
      }
      return ['![', `](${_embedBlock.detail.src})`, trimCurlies]
    default:
      return ['', '']
  }
}

/**
 * Renders Text as HTML
 */
export function textToHtml(text: Text, theme?: any): string {
  return renderText({
    text,
    tagMapFn: markToHtml,
    theme,
  }).replaceAll('\n', '<br />')
}

/**
 * Renders Text as Markdown
 */
export function textToMarkdown(
  text: Text,
  linkedDocs?: DocumentDict<Document>
): string {
  const preprocessed: Text = {
    ...text,
    textValue: text.textValue.replaceAll('[', '{').replaceAll(']', '}'),
  }
  return renderText({
    text: preprocessed,
    tagMapFn: markToMarkdown,
    linkedDocs,
    escapeFn: escapeReserved,
  })
    .replaceAll(/ +/g, ' ')
    .replaceAll('\n', '  \n')
    .replaceAll('\t', ' ')
    .trimStart()
}

/**
 * Renders Text as markup/markdown
 */
export function renderText({
  text,
  tagMapFn,
  linkedDocs,
  escapeFn = (_s: string) => _s,
  theme
}: {
  text: Text
  tagMapFn: TagMapFnType
  linkedDocs?: DocumentDict<Document>
  escapeFn?: (_s: string) => string
  theme?: any
}): string {
  let _html = text.textValue

  if (!text.ranges.length) {
    return escapeFn(_html)
  }

  // sort ranges by offset, descending
  const _ranges = [...text.ranges]
  _ranges.sort((a, b) => {
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
        const [__open, __close, __transform] = tagMapFn({
          mark: __mark,
          linkedDocs: linkedDocs ?? {},
          colors: theme?.colors
        })
        _openTags += typeof __open === 'function' ? __open(_segment) : __open
        _closeTags = `${
          typeof __close === 'function' ? __close(_segment) : __close
        }${_closeTags}`
        if (__transform) {
          _segment = (__transform as StringTransformFn)(_segment)
        }
        _segment = escapeFn(_segment)
      })
      _html = `${_before}${_openTags}${_segment}${_closeTags}${_after}`
    } catch (err) {
      console.warn('[renderText]', err)
      _html = `${_before}${_segment}${_after}`
    }
  })
  return _html
}
