import { SelectOption } from './UI'
import { Text } from './Text'
import { Document } from './Document'

export enum BlockType {
  Entry = 'ENTRY',
  Source = 'SOURCE',
  Topic = 'TOPIC',
  EndSource = 'END_SOURCE',
  EndTopic = 'END_TOPIC',
}

export interface BlockReference extends Document {
  type: BlockType
}

export interface Block extends BlockReference {
  page?: string
  text: Text
  __showCitationMenu?: boolean
  __showTopicMenu?: boolean
  __showNewBlockMenu?: boolean
  __showInlineCitationMenu?: boolean
  __showInlineTopicMenu?: boolean
  __isActive?: boolean
}

export interface Author {
  firstName: Text
  lastName: Text
}

export interface Citations {
  format: string
  text: Text
}

export interface SourceDetail {
  authors: Author[]
  publisher?: string
  editors?: Author[]
  translators?: Author[]
  citations?: Citations[]
  title?: Text
  journalTitle?: Text | null
  chapterTitle?: Text | null

  // publication details (common)
  publicationType?: SelectOption | null | undefined
  publisherName?: Text
  publisherPlace?: Text
  year?: Text
  month?: SelectOption | null | undefined
  volume?: Text
  issue?: Text
  yearPublished?: Text
  page?: Text
  // catalog identifiers (book)
  isbn?: Text

  // catalog identifiers (articles)
  doi?: Text
  issn?: Text
  url?: Text
}

export interface SourceCitationHeader extends Source {
  isInPages?: string[]
}

export interface Source extends Block {
  detail: SourceDetail
}

export interface Topic extends Block {
  isInPages?: string[]
}

export interface CacheDict<T> {
  [key: string]: T
}
export interface BlockRelationsServerResponse {
  count: number
  results: CacheDict<BlockRelation[]>
}

export interface BlockRelation extends Document {
  block: string
  relatedBlock: string
  relationshipType: 'HEADING' | 'INLINE'
  relatedBlockType: BlockType
  page: string
  blockIndex: number
  blockText: Text
}
