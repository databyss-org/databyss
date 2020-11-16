import {
  CatalogService, 
  CatalogType,
  GroupedCatalogResults, 
} from '../interfaces'
import {
  findPublicationMonthOption,
  getPublicationTypeById,
  isBook,
  normalizePublicationId,
} from '../sources/lib'
import { defaultMonthOption } from '../sources/constants/MonthOptions'
import { defaultPublicationType } from '../sources/constants/PublicationTypes'
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
  getPublisher: (apiResult: any) =>  c(apiResult.volumeInfo.publisher),
  getPublishedYear: (apiResult: any) =>
    apiResult.volumeInfo.publishedDate?.substring(0, 4),

  // publication details (common)
  getPublicationType: (apiResult: any) => {
    const pubId = normalizePublicationId(apiResult.kind, CatalogType.GoogleBooks)
    const pubType = getPublicationTypeById(pubId)
    if (!pubType) {
      return defaultPublicationType
    }
    return pubType
  },
  getPublisherPlace: (apiResult: any) =>
    // TODO: confirm they never provide it
    '',
  getPublishedYear: (apiResult: any) => {
    return apiResult.volumeInfo.publishedDate?.substring(0, 4)
  },
  getPublishedMonth: (apiResult: any, publicationType: string) => {
    if (isBook(publicationType)) {
      return defaultMonthOption
    }
    return findPublicationMonthOption(rawMonth)
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
    // TODO: confirm they never provide it
    return ''
  },

  // catalog identifiers (articles)
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
