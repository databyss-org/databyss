import { CacheDict, CacheList, NullableCache } from './'
import { Source, Author, SourceCitationHeader } from './Block'

export interface SourceState {
  cache: CacheDict<Source>
  authorsHeaderCache: CacheList<Author>
  citationHeaderCache: NullableCache<SourceCitationHeader>
  preferredCitationStyle: string
}
