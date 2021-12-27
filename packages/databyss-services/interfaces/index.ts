import React from 'react'
import { ResourcePending } from './ResourcePending'

export { ResourcePending } from './ResourcePending'
export { MediaTypes } from './Block'
export {
  NetworkUnavailableError,
  NotAuthorizedError,
  InsufficientPermissionError,
  ResourceNotFoundError,
  VersionConflictError,
  UnexpectedServerError,
} from './Errors'
export type { PageHeader } from './Page'
export { Page, UNTITLED_PAGE_NAME } from './Page'
export { Point } from './Point'
export { Selection } from './Selection'
export { Text } from './Text'
export type {
  Source,
  SourceDetail,
  Author,
  AuthorName,
  Topic,
  SourceCitationHeader,
  IndexPageResult,
  BlockReference,
  BlockRelationsServerResponse,
  BlockRelation,
  Embed,
} from './Block'
export type { Document, DocumentDict } from './Document'
export type { BibliographyItem, BibliographyDict } from './Bibliography'
export { BlockType, Block } from './Block'
export type { FSA } from './FSA'
export { RangeType } from './Range'
export type { Range } from './Range'
export type { PageState } from './PageState'
export type { ExtendedPatch, PatchBatch } from './Patch'
export type { SourceState } from './SourceState'
export type { TopicState } from './TopicState'
export type {
  CatalogState,
  CatalogResult,
  GroupedCatalogResults,
  CatalogService,
} from './CatalogState'
export { CatalogType } from './CatalogState'
export type {
  CitationFormatOptions,
  CitationDTO,
  CitationProcessOptions,
} from './Citation'
export type ResourceResponse<T> = T | ResourcePending | Error | null
export interface CacheDict<T> {
  [key: string]: ResourceResponse<T>
}
export type NullableCache<T> = ResourceResponse<CacheDict<T>>
export type CacheList<T> = ResourceResponse<T[]>
export interface RefDict {
  [key: string]: React.Ref<HTMLInputElement>
}

export { Group } from './Group'
