import { makeText } from '../blocks/makeText'
import {
  BlockType,
  CatalogResult,
  CatalogService,
  CatalogType,
  GroupedCatalogResults,
  Source,
} from '../interfaces'

import {
  buildDatabyssName,
  buildFullTitle,
  buildOnlyTitle,
  splitName,
  getCatalogSearchType,
} from './util'
import { SEARCH_CATALOG, CACHE_SEARCH_RESULTS } from './constants'
import crossref from './crossref'
import googleBooks from './googleBooks'
import openLibrary from './openLibrary'
import { DatabyssError } from '../interfaces/Errors'

interface CatalogParsingParams {
  service: CatalogService
  result: any
}

const serviceMap: { [type: string]: CatalogService } = {
  [CatalogType.GoogleBooks]: googleBooks,
  [CatalogType.OpenLibrary]: openLibrary,
  [CatalogType.Crossref]: crossref,
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
      if ((error as DatabyssError).name !== 'NetworkUnavailableError') {
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

  // all query terms must be included* in one of: title, subtitile or author
  // *included as prefix search
  const _queryTerms = _query.split(/\b/)
  let _filteredResults = _allResults

  // if an ISBN or DOI is provided, do not filter results
  if (!getCatalogSearchType(query)) {
    _filteredResults = _allResults.filter((_apiResult) => {
      const _resultFields = [
        service.getTitle(_apiResult),
        service.getSubtitle(_apiResult),
      ].concat(service.getAuthors(_apiResult))
      return _queryTerms.reduce(
        (qacc: Boolean, qcurr: string) =>
          // normalize accents and strip non alphanumeric from both search and query
          qacc &&
          _resultFields.reduce(
            (racc: Boolean, rcurr: string) =>
              racc ||
              (rcurr &&
                rcurr
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9 ]/gi, '')
                  .match(
                    new RegExp(
                      `\\b${qcurr
                        ?.normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')}`,
                      'i'
                    )
                  )),
            false
          ),
        true
      )
    })
  }

  if (!_filteredResults) {
    return {}
  }

  // organizes according to author(s)
  const _titles: { [title: string]: any } = {} // dedupe dict for titles
  const _groupedResults: GroupedCatalogResults = {}
  _filteredResults.forEach((_apiResult: any) => {
    const _authorsString = service.getAuthors(_apiResult).join(', ')
    const _result: CatalogResult = {
      title: buildFullTitle({ service, result: _apiResult }),
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
function sourceFromResult(options: CatalogParsingParams): Source {
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
