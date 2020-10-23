import {
  CatalogService, 
  CatalogType,
  GroupedCatalogResults, 
} from '../interfaces'
import { defaultMonthOption } from '../citations/constants/MonthOptions'
import { defaultPublicationType } from '../citations/constants/PublicationTypes'
import { getPublicationTypeById } from '../citations/services/getPublicationTypeById'
import { normalizePublicationId } from '../citations/services/normalizePublicationId'
import isBook from '../sources/services/isBook'
import request from '../lib/request'

import { GOOGLE_BOOKS } from './constants'
import { stripText as c } from './util'

const googleBooks: CatalogService = {
  type: GOOGLE_BOOKS,

  search: async (query: string): Promise<GroupedCatalogResults> => {
    const results = await request(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&key=AIzaSyCCoJxl3VhVwvM4v4cHSPJY6hsK-kh5VBk`
    )
    return results
  },
  getResults: (apiResults: any) => apiResults.items,

  // details
  getAuthors: (apiResult: any) => c(apiResult.volumeInfo.authors || []),
  getTitle: (apiResult: any) => c(apiResult.volumeInfo.title),
  getSubtitle: (apiResult: any) => c(apiResult.volumeInfo.subtitle),

  // publication details (common)
  getPublicationType: (apiResult: any) => {
    const pubId = normalizePublicationId(apiResult.kind, CatalogType.GoogleBooks)
    const pubType = getPublicationTypeById(pubId)
    if (!pubType) {
      return defaultPublicationType
    }
    return pubType
  },
  getPublisher: (apiResult: any) => {
    return apiResult.volumeInfo.publisher
  },
  getPublisherPlace: (apiResult: any) => {
    // TODO: confirm they never provide it
    return ''
  },
  getPublishedYear: (apiResult: any) => {
    return apiResult.volumeInfo.publishedDate?.substring(0, 4)
  },
  getPublishedMonth: (apiResult: any, publicationType: string) => {
    if (isBook(publicationType)) {
      return defaultMonthOption
    }

    return findPublicationMonthOption(rawMonth)
  },
  
  // publication details (book)
  getISBN: (apiResult: any) => {
    // TODO: confirm they never provide it
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
    // TODO: confirm they never provide it
    return ''
  },
}

export default googleBooks
