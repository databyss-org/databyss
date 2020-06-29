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
