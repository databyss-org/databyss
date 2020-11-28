import { CacheDict, ResourceResponse } from './index'
import { BlockRelationsServerResponse } from './Block'

export interface AtomicRelationResponse {
  count: string
  results: CacheDict<BlockRelationsServerResponse>
}

export interface EntryState {
  searchCache: CacheDict<ResourceResponse<BlockRelationsServerResponse>>
  searchTerm: string
  blockRelationsSearchCache: CacheDict<
    ResourceResponse<BlockRelationsServerResponse>
  >
}
