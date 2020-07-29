import { Text } from './Text'

export enum BlockType {
  Entry = 'ENTRY',
  Source = 'SOURCE',
  Topic = 'TOPIC',
  EndSource = 'END_SOURCE',
  EndTopic = 'END_TOPIC',
}
export interface Block {
  _id: string
  type: BlockType
  text: Text
}

export interface Author {
  firstName: string
  lastName: string
}

export interface SourceDetail {
  authors: Author[]
  citations: Text[]
}

export interface Source extends Block {
  detail: SourceDetail
}

export interface Topic extends Block {}
