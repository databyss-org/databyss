import { ResourcePending } from './ResourcePending'

export { ResourcePending } from './ResourcePending'
export { NetworkUnavailableError, NotAuthorizedError, ResourceNotFoundError } from './Errors'
import{ Page, PageHeader } from './Page'

export type { Text } from './Text'
import { Block } from './Block'
import { Selection } from './Selection';
export type { Source, SourceDetail, Author, Topic } from './Block'
export { BlockType } from './Block'
export type { FSA } from './FSA'
export type { Range } from './Range'
import { Point } from './Point';
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


export type Block = Block
export type Point = Point
export type PageHeader = PageHeader
export type Page = Page
export type Selection= Selection