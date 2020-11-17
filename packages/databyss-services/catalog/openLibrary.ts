import {
  CatalogService,
  CatalogType,
  GroupedCatalogResults,
} from '../interfaces'
import {
  getPublicationTypeById,
  isBook,
  normalizePublicationId,
} from '../sources/lib'
import { defaultMonthOption } from '../sources/constants/MonthOptions'
import { defaultPublicationType } from '../sources/constants/PublicationTypes'
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
  getPublisher: (apiResult: any) =>
    apiResult.publisher && c(apiResult.publisher[0]),
  // publication details (common)
  getPublicationType: (apiResult: any) => {
    const pubId = normalizePublicationId(
      apiResult.type,
      CatalogType.OpenLibrary
    )
    const pubType = getPublicationTypeById(pubId)
    if (!pubType) {
      return defaultPublicationType
    }
    return pubType
  },
  getPublisherPlace: (apiResult: any) => {
    const keys = {
      hasPlace: apiResult.place !== undefined,
      hasPublishPlace: apiResult.publish_place !== undefined,
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
      const publisherPlace = apiResult.publish_place
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
  getPublishedMonth: (apiResult: any, publicationType: string) => {
    if (isBook(publicationType)) {
      return defaultMonthOption
    }

    /*
      All of the items returned by this catalog are books so far.
      The few that have months have it in the `publish_date` array property,
      and they are a string, e.g.
      - publish_date: ['May 01, 2000']
      - publish_date: ['March 1, 2000']
      TODO: spend time figuring out how to parse this if it's useful
    */

    return defaultMonthOption
  },

  // publication details (articles)
  getJournalTitle: (apiResult: any) =>
    // TODO: confirm they never provide it
    '',
  getIssue: (apiResult: any) =>
    // TODO: confirm they never provide it
    '',
  getVolume: (apiResult: any) =>
    // TODO: confirm they never provide it
    '',

  // catalog identifiers (book)
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

  // catalog identifiers (articles)
  getDOI: (apiResult: any) =>
    // TODO: confirm they never provide it
    '',
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
