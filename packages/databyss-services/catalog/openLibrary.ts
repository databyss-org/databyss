import {
  CatalogService,
  CatalogType,
  GroupedCatalogResults,
} from '../interfaces'
import { defaultMonthOption } from '../sources/constants/MonthOptions'
import { defaultPublicationType } from '../sources/constants/PublicationTypes'
import { getPublicationTypeById, normalizePublicationId } from '../sources/lib'
import request from '../lib/request'

import { OPEN_LIBRARY } from './constants'
import { stripText as c, stripTextFromArray as cArray } from './util'

const openLibrary: CatalogService = {
  type: OPEN_LIBRARY,

  search: async (query: string): Promise<GroupedCatalogResults> => {
    const results = await request<GroupedCatalogResults>(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
      {
        timeout: 15000,
      }
    )
    return results
  },
  getResults: (apiResults: any) => apiResults.docs,

  // details
  getAuthors: (apiResult: any) => cArray(apiResult.author_name || []),
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
    const keys = {
      hasPlace: apiResult.place !== undefined,
      hasPublishPlace: apiResult.publish_place !== undefined,
      hasPublisherLocation: apiResult['publisher-location'] !== undefined,
    }

    const responseParts: any = []
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

  /*
    All items returned by this catalog are books,
    and publication month is of no interest
    for this typeat this time.
  */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPublishedMonth: () => defaultMonthOption,

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

  // publication details (journal article)
  getJournalTitle: () =>
    // TODO: confirm they never provide it
    '',
  getIssue: () =>
    // TODO: confirm they never provide it
    '',
  getVolume: () =>
    // TODO: confirm they never provide it
    '',
  getDOI: () =>
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
