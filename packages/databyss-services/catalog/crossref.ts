import {
  CatalogService,
  CatalogType,
  GroupedCatalogResults,
} from '../interfaces'
import { SelectOption } from '../interfaces/UI'
import {
  findPublicationMonthOption,
  getPublicationTypeById,
  isBook,
  normalizePublicationId,
} from '../sources/lib'
import { defaultMonthOption } from '../sources/constants/MonthOptions'
import { defaultPublicationType } from '../sources/constants/PublicationTypes'
import request from '../lib/request'
import {
  stripText as c,
  getCatalogSearchType,
  stripTextFromArray as cArray,
} from './util'
import { CROSSREF } from './constants'

const crossref: CatalogService = {
  type: CROSSREF,

  search: async (query: string): Promise<GroupedCatalogResults> => {
    let _baseUri = 'https://api.crossref.org/works?query='

    if (getCatalogSearchType(query) === 'DOI') {
      _baseUri = `https://api.crossref.org/works/`
    }

    let _uri = `${_baseUri}${
      !getCatalogSearchType(query) ? encodeURIComponent(query) : query
    }`
    if (process.env.CITEBOT_EMAIL && !getCatalogSearchType(query)) {
      _uri += `&mailto=${process.env.CITEBOT_EMAIL}`
    }
    const results = await request<GroupedCatalogResults>(_uri, {
      timeout: 15000,
    })

    return results
  },
  getResults: (apiResults: any) =>
    apiResults.message.items || [apiResults.message],

  // details
  getAuthors: (apiResult: any) =>
    cArray((apiResult.author || []).map(authorName)),
  getTitle: (apiResult: any) => c(apiResult.title ? apiResult.title[0] : ''),
  getSubtitle: (apiResult: any) => c(apiResult.subtitle?.[0]),
  getPublisher: (apiResult: any) => c(apiResult.publisher),

  // publication details (common)
  getPublicationType: (apiResult: any) => {
    const pubId = normalizePublicationId(apiResult.type, CatalogType.Crossref)
    if (!pubId) {
      return defaultPublicationType
    }
    const pubType = getPublicationTypeById(pubId)
    if (!pubType) {
      return defaultPublicationType
    }
    return pubType
  },
  getPublisherPlace: (apiResult: any) => {
    const publisherLocation = apiResult['publisher-location']
    if (publisherLocation) {
      return publisherLocation
    }
    return ''
  },
  getPublishedYear: (apiResult: any) =>
    apiResult.issued?.['date-parts']?.[0]?.[0] ||
    apiResult['published-print']?.['date-parts']?.[0]?.[0] ||
    apiResult['published-online']?.['date-parts']?.[0]?.[0] ||
    apiResult.approved?.['date-parts']?.[0]?.[0] ||
    apiResult.created?.['date-parts']?.[0]?.[0],
  getPublishedMonth: (apiResult: any, publicationType: SelectOption) => {
    if (isBook(publicationType)) {
      return defaultMonthOption
    }

    const rawMonth =
      apiResult.issued?.['date-parts']?.[0]?.[1] ||
      apiResult['published-print']?.['date-parts']?.[0]?.[1] ||
      apiResult['published-online']?.['date-parts']?.[0]?.[1] ||
      apiResult.approved?.['date-parts']?.[0]?.[1] ||
      apiResult.created?.['date-parts']?.[0]?.[1]

    return findPublicationMonthOption(rawMonth)
  },

  // publication details (articles)
  getJournalTitle: (apiResult: any) => {
    if (apiResult['container-title-short']) {
      return apiResult['container-title-short']
    }
    if (apiResult['container-title']) {
      return apiResult['container-title'][0]
    }
    return ''
  },
  getIssue: (apiResult: any) => {
    if (apiResult.issue) {
      return apiResult.issue
    }
    return ''
  },
  getVolume: (apiResult: any) => {
    if (apiResult.volume) {
      return apiResult.volume
    }
    return ''
  },

  // catalog identifiers (book)
  getISBN: (apiResult: any) => {
    if (apiResult.ISBN) {
      if (Array.isArray(apiResult.ISBN)) {
        // pick first one
        return apiResult.ISBN[0]
      }
      return apiResult.ISBN
    }
    return ''
  },

  // catalog identifiers (articles)
  getDOI: (apiResult: any) => {
    if (apiResult.DOI) {
      return apiResult.DOI
    }
    return ''
  },
  getISSN: (apiResult: any) => {
    if (apiResult.ISSN) {
      if (Array.isArray(apiResult.ISSN)) {
        // pick first one
        return apiResult.ISSN[0]
      }
      return apiResult.ISSN
    }
    return ''
  },
}

export default crossref

function authorName(crossrefAuthor: any): string {
  let _name = ''
  if (crossrefAuthor.given) {
    _name += crossrefAuthor.given
  }
  if (crossrefAuthor.family) {
    if (_name.length) {
      _name += ' '
    }
    _name += crossrefAuthor.family
  }
  return _name
}
