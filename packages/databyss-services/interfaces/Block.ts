import { uid } from '@databyss-org/data/lib/uid'
import { SelectOption } from './UI'
import { Text } from './Text'
import { Document } from './Document'

import { InlineTypes } from './Range'

export enum BlockType {
  Entry = 'ENTRY',
  Source = 'SOURCE',
  Topic = 'TOPIC',
  EndSource = 'END_SOURCE',
  EndTopic = 'END_TOPIC',
  Embed = 'EMBED',
  Link = 'LINK',
  _ANY = '_ANY',
}

export interface BlockReference {
  _id: string
  type: BlockType
}

export class Block implements BlockReference {
  _id: string
  page?: string
  text: Text
  type: BlockType
  __showCitationMenu?: boolean
  __showTopicMenu?: boolean
  __showNewBlockMenu?: boolean
  __showInlineCitationMenu?: boolean
  __showInlineEmbedMenu?: boolean
  __showInlineLinkMenu?: boolean
  __showInlineTopicMenu?: boolean
  __isActive?: boolean

  constructor() {
    this.type = BlockType.Entry
    this._id = uid()
    this.text = { textValue: '', ranges: [] }
  }
}

export interface Author {
  firstName: Text
  lastName: Text
}

export interface AuthorName {
  firstName: string | null
  lastName: string | null
}

export interface Citations {
  format: string
  text: Text
}

export enum MediaTypes {
  IFRAME = 'iframe',
  IMAGE = 'image',
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  HTML = 'html',
  WEBSITE = 'website',
  UNFETCHED = 'unfetchedMedia',
}

export interface FileDetail {
  filename: string
  contentLength: number
  contentType: string // TODO replace with MIME types
  storageKey: string
}

export interface EmbedDetail {
  title?: string
  src: string
  dimensions?: {
    width: number
    height: number
  }
  mediaType: MediaTypes
  embedCode?: string
  openGraphJson?: string
  fileDetail: FileDetail
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
  name?: Text
}

export interface Embed extends Block {
  detail: EmbedDetail
}

export interface Topic extends Block {
  isInPages?: string[]
}

export interface CacheDict<T> {
  [key: string]: T
}
export interface BlockRelationsServerResponse {
  count: number
  results: CacheDict<IndexPageResult[]>
}

export enum BlockRelationshipType {
  'HEADING' = 'HEADING',
  'INLINE' = 'INLINE',
}

export interface IndexPageResult {
  _id?: string
  block: string
  relatedBlock: string
  relationshipType: BlockRelationshipType
  relatedBlockType: BlockType | InlineTypes.Link
  relatedBlockText?: string
  page: string
  blockIndex: number
  blockText: Text
  activeInlines?: IndexPageResult[]
  activeHeadings?: IndexPageResult[]
}

export interface BlockRelation extends Document {
  _id: string
  blockId: string
  blockType: BlockType
  pages: string[]
}
