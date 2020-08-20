import googleBooks from './googleBooks'
import openLibrary from './openLibrary'
import { SEARCH_CATALOG, CACHE_SEARCH_RESULTS } from './constants'
import {
  CatalogType,
  NetworkUnavailableError,
  CatalogService,
  GroupedCatalogResults,
  CatalogResult,
  Source,
  BlockType,
  Text,
} from '../interfaces'

const serviceMap: { [type: string]: CatalogService } = {
  [CatalogType.GoogleBooks]: googleBooks,
  [CatalogType.OpenLibrary]: openLibrary,
}

export function searchCatalog({
  type,
  query,
}: {
  type: CatalogType
  query: string
}) {
  return async (dispatch: Function) => {
    dispatch({
      type: SEARCH_CATALOG,
      payload: { type, query },
    })

    try {
      const results = composeResults({
        service: serviceMap[type],
        results: await serviceMap[type].search(query),
        query,
      })
      dispatch({
        type: CACHE_SEARCH_RESULTS,
        payload: {
          query,
          type,
          results,
        },
      })
    } catch (error) {
      // if offline
      if (error instanceof NetworkUnavailableError) {
        dispatch({
          type: CACHE_SEARCH_RESULTS,
          payload: {
            query,
            type,
            results: [],
          },
        })
      } else {
        throw error
      }
    }
  }
}

// composes catalog results into a dictionary with author as the key
function composeResults({
  results,
  query,
  service,
}: {
  results: any
  query: string
  service: CatalogService
}): GroupedCatalogResults {
  const _query = query.toLowerCase()
  const _allResults = service.getResults(results)

  if (!_allResults?.length) {
    return {}
  }

  // at least one query term must be included* in title, subtitile or author
  // *included as prefix search
  const _queryTerms = _query.split(/\b/)
  const _filteredResults = _allResults.filter(_apiResult => {
    const _resultFields = [
      service.getTitle(_apiResult),
      service.getSubtitle(_apiResult),
    ].concat(service.getAuthors(_apiResult))
    return _queryTerms.reduce((qacc: Boolean, qcurr: string) => 
      (qacc || _resultFields.reduce(
        (racc: Boolean, rcurr: string) =>
          racc || (rcurr && rcurr.match(new RegExp(`\\b${qcurr}`, 'i'))),
        false)
    ), false)
  })

  if (!_filteredResults) {
    return {}
  }

  // organizes according to author(s)
  const _titles: { [title: string]: any } = {} // dedupe dict for titles
  const _groupedResults: GroupedCatalogResults = {}
  _filteredResults.forEach((_apiResult: any) => {
    const _authorsString = service.getAuthors(_apiResult).join(', ')
    const _result: CatalogResult = {
      title: titleFromResult({ service, result: _apiResult }),
      source: sourceFromResult({ service, result: _apiResult }),
      apiResult: _apiResult,
    }

    // if not a duplicate, push to author array
    if (!_titles[_result.title.textValue]) {
      _groupedResults[_authorsString] = (
        _groupedResults[_authorsString] || []
      ).concat(_result)
      _titles[_result.title.textValue] = _result
    }
  })

  return _groupedResults
}

/**
 * composes Source from api result
 */
function sourceFromResult({
  service,
  result,
}: {
  service: CatalogService
  result: any
}): Source {
  const _authors = service.getAuthors(result)
  const _names = _authors.length && splitName(_authors[0])

  const _authorText = _names
    ? _names[1] +
      (_names[0] ? ', ' : '.') +
      (_names[0] ? `${_names[0].replace('.', '')}.` : '')
    : ''

  const _text = titleFromResult({ service, result })
  _text.textValue = `${_authorText} ${_text.textValue}`
  _text.ranges[0].offset += _authorText.length + 1

  return {
    _id: '', // will be generated if imported
    type: BlockType.Source,
    text: _text,
    detail: {
      authors: _authors.length
        ? _authors.map((_a: string) => {
            const _n = splitName(_a)
            return {
              firstName: { textValue: _n[0], ranges: [] },
              lastName: { textValue: _n[1], ranges: [] },
            }
          })
        : [],
      citations: [],
    },
  }
}

function splitName(name: string) {
  return [
    name
      .split(' ')
      .slice(0, -1)
      .join(' '),
    name
      .split(' ')
      .slice(-1)
      .join(' '),
  ]
}

/**
 * composes source title
 * @param result catalog API result
 * @returns Text with formatted source title
 */
function titleFromResult({
  service,
  result,
}: {
  service: CatalogService
  result: any
}): Text {
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
    _text.textValue += ` (${service.getPublishedYear(result)})`
  }

  return _text
}
