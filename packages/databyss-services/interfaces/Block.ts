import { SelectOption } from './CatalogState'
import { Text } from './Text'

export enum BlockType {
  Entry = 'ENTRY',
  Source = 'SOURCE',
  Topic = 'TOPIC',
  EndSource = 'END_SOURCE',
  EndTopic = 'END_TOPIC',
}

// interface InlineAtomic {
//   word: string
//   offset: number
// }

export interface Block {
  _id: string
  type: BlockType
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

  // publication details (common)
  publicationType?: SelectOption | null | undefined
  publisherName?: Text
  publisherPlace?: Text
  year?: Text
  month?: SelectOption | null | undefined

  // publication details (articles)
  journalTitle?: Text
  volume?: Text
  issue?: Text

  // catalog identifiers (book)
  isbn?: Text

  // catalog identifiers (articles)
  doi?: Text
  issn?: Text
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
