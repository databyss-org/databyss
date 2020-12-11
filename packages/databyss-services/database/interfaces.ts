import { Text } from '../interfaces/Text'
import { PageHeader } from '../interfaces/Page'
import { Selection } from '../interfaces/Selection'

export interface MangoResponse<D> {
  docs: D[]
}

export enum DocumentType {
  Page = 'PAGE',
  Block = 'BLOCK',
  Selection = 'SELECTION',
}

export enum BlockType {
  Entry = 'ENTRY',
  Source = 'SOURCE',
  Topic = 'TOPIC',
  EndSource = 'END_SOURCE',
  EndTopic = 'END_TOPIC',
}

export interface Block {
  _id: string
  documentType: DocumentType.Block
  type: BlockType.Entry
  text: Text
}

interface PageBlock {
  _id: string
  type: BlockType.Entry
}

export interface DbPage extends PageHeader {
  blocks: PageBlock[]
  selection: Selection
  publicAccountId?: string
  documentType: DocumentType.Page
}
