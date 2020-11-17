import stripHtml from 'string-strip-html'
import { CatalogParsingParams, Text } from '../interfaces/CatalogState'

/**
 * Removes unwanted entities (e.g. html tags) from catalog results
 * @param text string or array of strings to cleanup
 */
export function stripText(text: string | string[]) {
  if (!text) {
    return text
  }
  if (Array.isArray(text)) {
    return text.map((t) => stripHtml(t).result)
  }
  return stripHtml(text).result
}

export const getCatalogSearchType = (query: string) => {
  // DOI
  if (query.match(/^10.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i)) {
    return 'DOI'
  }
  // ISBN
  if (query.match(/\b(\d\s*?){10,13}\b/gm)) {
    return 'ISBN'
  }
  return false
}
/**
 * Composes source title using title and subtitle from service results.
 * @param options An instance of CatalogParsingParams
 * @returns Text with formatted source title
 */
export function buildFullTitle(options: CatalogParsingParams): Text {
  const { service, result } = options

  const _text: Text = {
    textValue: service.getTitle(result),
    ranges: [],
  }

  if (service.getSubtitle(result)) {
    _text.textValue += `: ${service.getSubtitle(result)}`
  }

  _text.ranges = [
    {
      offset: 0,
      length: _text.textValue.length,
      marks: ['italic'],
    },
  ]

  if (service.getPublishedYear(result)) {
    _text.textValue += ` (${
      service.getPublisher(result) ? `${service.getPublisher(result)}, ` : ''
    }${service.getPublishedYear(result)})`
  }

  return _text
}

/**
 * Composes source title using only the title from the service results.
 * @param options An instance of CatalogParsingParams
 * @returns Text with formatted source title
 */
export function buildOnlyTitle(options: CatalogParsingParams): Text {
  const { service, result } = options

  const _text: Text = {
    textValue: service.getTitle(result),
    ranges: [],
  }

  if (service.getSubtitle(result)) {
    _text.textValue += `: ${service.getSubtitle(result)}`
  }

  return _text
}

export function buildDatabyssName(options: CatalogParsingParams): Text {
  const { service, result } = options

  const _authors = service.getAuthors(result)
  const _names = _authors.length && splitName(_authors[0])

  const _authorText = _names
    ? _names[1] +
      (_names[0] ? ', ' : '.') +
      (_names[0] ? `${_names[0].charAt(0)}.` : '')
    : ''

  const _text = buildFullTitle({ service, result })
  _text.textValue = `${_authorText} ${_text.textValue}`
  _text.ranges[0].offset += _authorText.length + 1

  return _text
}

export function splitName(name: string) {
  return [
    name.split(' ').slice(0, -1).join(' '),
    name.split(' ').slice(-1).join(' '),
  ]
}
