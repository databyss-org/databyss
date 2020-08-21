import { ResourcePending } from './ResourcePending'

export { ResourcePending } from './ResourcePending'
export {
  NetworkUnavailableError,
  NotAuthorizedError,
  InsufficientPermissionError,
  ResourceNotFoundError
} from './Errors'
export type { Page, PageHeader } from './Page'
export type { Point } from './Point'
export type { Selection } from './Selection'
export type { Block } from './Block'
export type { Text } from './Text'
export type { Source, SourceDetail, Author, Topic, SourceCitationHeader } from './Block'
export { BlockType } from './Block'
export type { FSA } from './FSA'
export type { Range } from './Range'
export type { PageState } from './PageState'
export type { PatchBatch } from './Patch'
export type { SourceState } from './SourceState'
export type { TopicState } from './TopicState'
export type { CatalogState, CatalogResult, GroupedCatalogResults, CatalogService } from './CatalogState'
export { CatalogType } from './CatalogState'
export type ResourceResponse<T> = T | ResourcePending | Error | null
export interface CacheDict<T> {
  [key: string]: ResourceResponse<T>
}
export type NullableCache<T> = ResourceResponse<CacheDict<T>>
export type CacheList<T> = ResourceResponse<T[]>
interface RefDict {
  [key: string]: React.Ref<HTMLInputElement>
}
