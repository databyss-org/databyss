import PCancelable from 'p-cancelable'
import { Page, PageHeader, CacheDict, NullableCache, RefDict } from './'

export interface PageState {
  cache: CacheDict<Page>
  headerCache: NullableCache<PageHeader>
  refDict: RefDict
  promiseDict: { [pageId: string]: PCancelable<Page> }
  sharedWithGroups: string[]
  focusIndex: number
}
