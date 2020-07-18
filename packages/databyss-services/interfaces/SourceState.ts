import { CacheDict, CacheList, NullableCache } from './'
import { Source, Author, SourceCitationHeader } from './Block'

export interface SourceSearchResults {
  [key: string]: any
}

export interface SourceState {
  cache: CacheDict<Source>
  searchCache: CacheDict<SourceSearchResults>
  authorsHeaderCache: CacheList<Author>
  citationHeaderCache: NullableCache<SourceCitationHeader>
}
