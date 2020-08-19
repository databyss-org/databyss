import googleBooks from './googleBooks'
import { SEARCH_CATALOG, CACHE_SEARCH_RESULTS } from './constants'
import {
  CatalogType,
  NetworkUnavailableError,
  CatalogService,
  GroupedCatalogResults,
  CatalogResult,
  Source,
  BlockType,
} from '../interfaces'

const serviceMap: { [type: string]: CatalogService } = {
  [CatalogType.GoogleBooks]: googleBooks,
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

// composes google results into a dictionary with author as the key
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

  if (!results.items) {
    return {}
  }

  // query must be included in title, subtitile or author
  const _filteredResults = service
    .getResults(results)
    .filter(_apiResult =>
      [service.getTitle(_apiResult), service.getSubtitle(_apiResult)]
        .concat(service.getAuthors(_apiResult))
        .reduce(
          (acc: Boolean, curr: string) =>
            acc || (curr && curr.match(new RegExp(`\\b${_query}`, 'i'))),
          false
        )
    )

  if (!_filteredResults) {
    return {}
  }

  // organizes according to author(s)
  const _titles: { [title: string]: any } = {} // dedupe dict for titles
  const _groupedResults: GroupedCatalogResults = {}
  _filteredResults.forEach((_apiResult: any) => {
    const _authorsString = service.getAuthors(_apiResult).join(', ')
    const _result: CatalogResult = {
      title: service.titleFromResult(_apiResult),
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

  const _text = service.titleFromResult(result)
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
