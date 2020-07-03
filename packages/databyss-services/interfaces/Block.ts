import { Text } from './Text'

export enum BlockType {
  Entry = 'ENTRY',
  Source = 'SOURCE',
  Topic = 'TOPIC',
}
export interface Block {
  _id: string
  type: BlockType
  text: Text
}

export interface Author {
  firstName: Text
  lastName: Text
}

export interface SourceDetail {
  authors: Author[]
  citations: Text[]
}

export interface Source extends Block {
  detail: SourceDetail
}

export interface Topic extends Block {}
