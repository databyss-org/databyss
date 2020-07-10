import { ResourcePending } from './ResourcePending'

export { ResourcePending } from './ResourcePending'
export { NetworkUnavailableError, NotAuthorizedError, ResourceNotFoundError } from './Errors'
export type { Page, PageHeader } from './Page'
export type { Text } from './Text'
export type { Block, Source, SourceDetail, Author, Topic } from './Block'
export { BlockType } from './Block'
export type { FSA } from './FSA'
export type { Range } from './Range'
export type { Point } from './Point'
export type { Selection } from './Selection'
export type { PageState } from './PageState'
export type { PatchBatch } from './Patch'
export type { SourceState } from './SourceState'
export type { TopicState } from './TopicState'

export type ResourceResponse<T> = T | ResourcePending | Error | null

export interface CacheDict<T> {
  [key: string]: ResourceResponse<T>
}

export type NullableCache<T> = ResourceResponse<CacheDict<T>>

export type CacheList<T> = ResourceResponse<T[]>

interface RefDict {
  [key: string]: React.Ref<HTMLInputElement>
}