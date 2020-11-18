import { SelectOption } from './UI'
import { Text, CacheDict, Source } from './'

export enum CatalogType {
  OpenLibrary = 'OPEN_LIBRARY',
  GoogleBooks = 'GOOGLE_BOOKS',
  Crossref = 'CROSSREF',
}

export interface CatalogResult {
  title: Text
  source: Source
  apiResult: any
}

export interface GroupedCatalogResults {
  [authorName: string]: CatalogResult[]
}

export interface CatalogState {
  searchCache: {
    [catalogType: string]: CacheDict<GroupedCatalogResults>
  }
}

export interface CatalogService {
  type: string

  search: (query: string) => any
  getResults: (apiResults: any) => Array<any>
  getAuthors: (apiResult: any) => string[]
  getTitle: (apiResult: any) => string
  getSubtitle: (apiResult: any) => string

  // publication details (common)
  getPublicationType: (apiResult: any) => SelectOption | null | undefined
  getPublisher: (apiResult: any) => string
  getPublisherPlace: (apiResult: any) => string
  getPublishedYear: (apiResult: any) => string
  getPublishedMonth: (
    apiResult: any,
    publicationType: SelectOption
  ) => SelectOption | null | undefined

  // publication details (book)
  getISBN: (apiResult: any) => string

  // publication details (journal article)
  getIssue: (apiResult: any) => string
  getVolume: (apiResult: any) => string
  getDOI: (apiResult: any) => string
  getISSN: (apiResult: any) => string
}

export interface CatalogParsingParams {
  service: CatalogService
  result: any
}
