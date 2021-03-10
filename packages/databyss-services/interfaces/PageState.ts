import { Page, PageHeader, CacheDict, NullableCache, RefDict } from './'

export interface PageState {
  cache: CacheDict<Page>
  headerCache: NullableCache<PageHeader>
  refDict: RefDict
}
