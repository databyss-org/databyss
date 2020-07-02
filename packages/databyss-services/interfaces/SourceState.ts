import { CacheDict } from './'
import { Source } from './Block'

export interface SourceSearchResults {
  [key: string]: any
}

export interface SourceState {
  cache: CacheDict<Source>
  searchCache: CacheDict<SourceSearchResults>
}
