import { Text, CacheDict } from './'

export enum CatalogType {
  OpenLibrary = 'OPEN_LIBRARY',
  GoogleBooks = 'GOOGLE_BOOKS',
  Crossref = 'CROSSREF',
}

export interface CatalogResult {
  title: Text
  meta: any
}

export interface GroupedCatalogResults {
  [authorName: string]: CatalogResult[]
}

export interface CatalogState {
  searchCache: {
    [catalogType: string]: CacheDict<GroupedCatalogResults>
  }
}
