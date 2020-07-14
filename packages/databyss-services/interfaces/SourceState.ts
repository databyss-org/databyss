import { CacheDict, CacheList } from './'
import { Source, Author, SourceCitations } from './Block'

export interface SourceSearchResults {
  [key: string]: any
}

export interface SourceState {
  cache: CacheDict<Source>
  searchCache: CacheDict<SourceSearchResults>
  authorsHeaderCache: CacheList<Author>
  sourceHeaderCache: CacheList<SourceCitations>
}
