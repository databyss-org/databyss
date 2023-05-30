import {
  CatalogService,
  CatalogType,
  GroupedCatalogResults,
} from '../interfaces'
import { getPublicationTypeById, normalizePublicationId } from '../sources/lib'
import { defaultMonthOption } from '../sources/constants/MonthOptions'
import { defaultPublicationType } from '../sources/constants/PublicationTypes'
import request from '../lib/request'
import { GOOGLE_BOOKS } from './constants'
import { stripText as c, stripTextFromArray as cArray } from './util'

const googleBooks: CatalogService = {
  type: GOOGLE_BOOKS,

  search: async (query: string): Promise<GroupedCatalogResults> => {
    const results = await request<GroupedCatalogResults>(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&key=AIzaSyCCoJxl3VhVwvM4v4cHSPJY6hsK-kh5VBk`,
      {
        timeout: 15000,
      }
    )
    return results
  },
  getResults: (apiResults: any) => apiResults.items,

  // details
  getAuthors: (apiResult: any) => cArray(apiResult.volumeInfo.authors || []),
  getTitle: (apiResult: any) => c(apiResult.volumeInfo.title),
  getSubtitle: (apiResult: any) => c(apiResult.volumeInfo.subtitle),
  getPublisher: (apiResult: any) => c(apiResult.volumeInfo.publisher),
  getPublishedYear: (apiResult: any) =>
    apiResult.volumeInfo.publishedDate?.substring(0, 4),

  // publication details (common)
  getPublicationType: (apiResult: any) => {
    const pubId = normalizePublicationId(
      apiResult.kind,
      CatalogType.GoogleBooks
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
  getPublisherPlace: () =>
    // TODO: confirm they never provide it
    '',

  /*
    All items returned by this catalog are books,
    and publication month is of no interest
    for this typeat this time.
  */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPublishedMonth: () => defaultMonthOption,

  // publication details (book)
  getJournalTitle: () =>
    // TODO: confirm they never provide it
    '',
  getISBN: () =>
    // TODO: confirm they never provide it
    '',

  // publication details (journal article)
  getIssue: () =>
    // TODO: confirm they never provide it
    '',
  getVolume: () =>
    // TODO: confirm they never provide it
    '',
  getDOI: () =>
    // TODO: confirm they never provide it
    '',
  getISSN: () =>
    // TODO: confirm they never provide it
    '',
}

export default googleBooks
