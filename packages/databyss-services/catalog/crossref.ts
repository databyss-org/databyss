import {
  CatalogService,
  CatalogType,
  GroupedCatalogResults,
} from '../interfaces'
import { getPublicationTypeById } from '../citations/services/getPublicationTypeById'
import { normalizePublicationId } from '../citations/services/normalizePublicationId'
import { PublicationTypeId } from '../citations/constants/PublicationTypeId'
import request from '../lib/request'

import { CROSSREF } from './constants'
import { stripText as c } from './util'

const crossref: CatalogService = {
  type: CROSSREF,

  search: async (query: string): Promise<GroupedCatalogResults> => {
    let _uri = `https://api.crossref.org/works?query=${encodeURIComponent(
      query
    )}`
    if (process.env.CITEBOT_EMAIL) {
      _uri += `&mailto=${process.env.CITEBOT_EMAIL}`
    }
    const results = await request(_uri)
    return results
  },
  getResults: (apiResults: any) => apiResults.message.items,

  // details
  getAuthors: (apiResult: any) => c((apiResult.author || []).map(authorName)),
  getTitle: (apiResult: any) => c(apiResult.title ? apiResult.title[0] : ''),
  getSubtitle: (apiResult: any) => c(apiResult.subtitle?.[0]),
  
  // publication details (common)
  getPublicationType: (apiResult: any) => {
    const pubId = normalizePublicationId(apiResult.type, CatalogType.Crossref)
    const pubType = getPublicationTypeById(pubId)
    if (!pubType) {
      // default to book
      return getPublicationTypeById(PublicationTypeId.BOOK)
    }
    return pubType
  },
  getPublisher: (apiResult: any) => {
    return apiResult.publisher
  },
  getPublisherPlace: (apiResult: any) => {
    const publisherLocation = apiResult['publisher-location']
    if (publisherLocation) {
      return publisherLocation
    }
    return ''
  },
  getPublishedYear: (apiResult: any) => {
    return apiResult.issued?.['date-parts']?.[0]?.[0] ||
      apiResult['published-print']?.['date-parts']?.[0]?.[0] ||
      apiResult['published-online']?.['date-parts']?.[0]?.[0] ||
      apiResult['approved']?.['date-parts']?.[0]?.[0] ||
      apiResult['created']?.['date-parts']?.[0]?.[0]
  },

  // publication details (book)
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

  // publication details (journal article)
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
