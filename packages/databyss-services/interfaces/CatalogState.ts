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
  search: (query: string) => any
  getResults: (apiResults: any) => Array<any>
  getAuthors: (apiResult: any) => string[]
  getTitle: (apiResult: any) => string
  getSubtitle: (apiResult: any) => string
  sourceFromResult: (apiResult: any) => Source
  titleFromResult: (apiResult: any) => Text
}
