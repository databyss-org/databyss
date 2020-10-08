import {
  CatalogService,
  CatalogType,
  GroupedCatalogResults,
} from '../interfaces'
import { getPublicationTypeById } from '../citations/services/get-publication-type-by-id'
import { normalizePublicationId } from '../citations/services/normalize-publication-id'
import { PublicationTypeId } from '../citations/constants/PublicationTypeId'
import request from '../lib/request'

import { OPEN_LIBRARY } from './constants'
import { stripText as c } from './util'

const openLibrary: CatalogService = {
  type: OPEN_LIBRARY,

  search: async (query: string): Promise<GroupedCatalogResults> => {
    const results = await request(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
    )
    return results
  },
  getResults: (apiResults: any) => apiResults.docs,

  // details
  getAuthors: (apiResult: any) => c(apiResult.author_name || []),
  getTitle: (apiResult: any) => c(apiResult.title),
  getSubtitle: (apiResult: any) => c(apiResult.subtitle),

  // publication details (common)
  getPublicationType: (apiResult: any) => {
    const pubId = normalizePublicationId(apiResult.type, CatalogType.OpenLibrary)
    const pubType = getPublicationTypeById(pubId)
    if (!pubType) {
      // default to book
      return getPublicationTypeById(PublicationTypeId.BOOK)
    }
    return pubType
  },
  getPublisher: (apiResult: any) => {
    return apiResult['publisher']?.[0]
  },
  getPublisherPlace: (apiResult: any) => {
    const keys = {
      hasPlace: apiResult['place'] !== undefined,
      hasPublishPlace: apiResult['publish_place'] !== undefined,
      hasPublisherLocation: apiResult['publisher-location'] !== undefined,
    }
    
    const responseParts = []
    if (keys.hasPlace) {
      if (Array.isArray(apiResult.place)) {
        responseParts.push(...apiResult.place)
      } else {
        responseParts.push(apiResult.place)
      }
    }

    if (keys.hasPublishPlace) {
      const publisherPlace = apiResult['publish_place']
      if (Array.isArray(publisherPlace)) {
        responseParts.push(...publisherPlace)
      } else {
        responseParts.push(publisherPlace)
      }
    }
    if (keys.hasPublisherLocation) {
      const publisherLocation = apiResult['publisher-location']
      if (Array.isArray(publisherLocation)) {
        responseParts.push(...publisherLocation)
      } else {
        responseParts.push(publisherLocation)
      }
    }

    return responseParts.join(', ')
  },
  getPublishedYear: (apiResult: any) => apiResult.first_publish_year,

  // publication details (book)
  getISBN: (apiResult: any) => {
    if (apiResult.isbn) {
      if (Array.isArray(apiResult.isbn)) {
        // pick first one
        return apiResult.isbn[0]
      }
      return apiResult.isbn
    }
    return ''
  },

  // publication details (journal article)
  getIssue: (apiResult: any) => {
    // TODO: confirm they never provide it
    return ''
  },
  getVolume: (apiResult: any) => {
    // TODO: confirm they never provide it
    return ''
  },
  getDOI: (apiResult: any) => {
    // TODO: confirm they never provide it
    return ''
  },
  getISSN: (apiResult: any) => {
    if (apiResult.issn) {
      if (Array.isArray(apiResult.issn)) {
        // pick first one
        return apiResult.issn[0]
      }
      return apiResult.issn
    }
    return ''
  },
}

export default openLibrary
