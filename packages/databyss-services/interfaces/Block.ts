import { Text } from './Text'

export enum BlockType {
  Entry = 'ENTRY',
  Source = 'SOURCE',
  Topic = 'TOPIC',
  EndSource = 'END_SOURCE',
  EndTopic = 'END_TOPIC',
}

interface InlineAtomic {
  word: string
  offset: number
}

export interface Block {
  _id: string
  type: BlockType
  text: Text
  __showCitationMenu?: boolean
  __showTopicMenu?: boolean
  __showNewBlockMenu?: boolean
  __showInlineCitationMenu?: InlineAtomic | false
  __showInlineTopicMenu?: InlineAtomic | false
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
  citations?: Citations[]
  doi?: string
  issn?: string
  year?: number
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
