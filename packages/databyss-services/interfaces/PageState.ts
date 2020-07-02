import { Page, PageHeader CacheDict, NullableCache, RefDict } from './'
import { ResourcePending } from './ResourcePending'

export interface PageState {
  cache: CacheDict<Page>,
  headerCache: NullableCache<PageHeader>,
  refDict: RefDict,
  patchQueueSize: number,
}