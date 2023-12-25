import stripHtml from 'string-strip-html'
import { CatalogParsingParams } from '../interfaces/CatalogState'
import { Text, RangeType, Source, BlockType } from '../interfaces'
import { makeText } from '../blocks'
/**
 * Removes unwanted entities (e.g. html tags) from catalog results
 * @param text string or array of strings to cleanup
 */
export function stripText(text: string) {
  if (!text) {
    return text
  }
  return stripHtml(text).result
}

export function stripTextFromArray(text: string[]) {
  if (Array.isArray(text)) {
    return text.map((t) => stripHtml(t).result)
  }
  return []
}

export const getCatalogSearchType = (query: string) => {
  // DOI
  if (query.match(/^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i)) {
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
      marks: [RangeType.Italic],
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

/**
 * composes Source from api result
 */
export function sourceFromCatalogResult(options: CatalogParsingParams): Source {
  const { service, result } = options

  const _authors = service.getAuthors(result)

  const publicationType = service.getPublicationType(result)

  return {
    _id: '', // will be generated if imported
    type: BlockType.Source,
    text: buildDatabyssName(options),
    detail: {
      authors: _authors.length
        ? _authors.map((_a: string) => {
            const _n = splitName(_a)
            return {
              firstName: makeText(_n[0]),
              lastName: makeText(_n[1]),
            }
          })
        : [],
      editors: [],
      translators: [],
      citations: [],
      title: buildOnlyTitle(options),

      // publication details (common)
      publicationType,
      publisherName: makeText(service.getPublisher(result)),
      publisherPlace: makeText(service.getPublisherPlace(result)),
      year: makeText(service.getPublishedYear(result)),
      month:
        publicationType && service.getPublishedMonth(result, publicationType),

      // publication details (articles)
      journalTitle:
        publicationType &&
        makeText(service.getJournalTitle(result, publicationType)),
      volume: makeText(service.getVolume(result)),
      issue: makeText(service.getIssue(result)),

      // catalog identifiers (book)
      isbn: makeText(service.getISBN(result)),

      // catalog identifiers (articles)
      doi: makeText(service.getDOI(result)),
      issn: makeText(service.getISSN(result)),
    },
  }
}
