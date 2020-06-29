import { ResourcePending } from './ResourcePending'

export { ResourcePending } from './ResourcePending'
export { NetworkUnavailableError, NotAuthorizedError, ResourceNotFoundError } from './Errors'
export type { Page, PageHeader } from './Page'
export type { Text } from './Text'
export type { Block } from './Block'
export { BlockType } from './Block'
export type { FSA } from './FSA'
export type { Range } from './Range'
export type { PageState } from './PageState'
export type { PatchBatch } from './Patch'

export interface CacheDict<T> {
  [key: string]: T | ResourcePending | Error | null
}

export type NullableCache<T> = CacheDict<T> | ResourcePending | Error | null

interface RefDict {
  [key: string]: React.Ref<HTMLInputElement>
}