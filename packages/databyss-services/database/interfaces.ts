import { Text } from '../interfaces/Text'
import { PageHeader, Page } from '../interfaces/Page'
import { Selection } from '../interfaces/Selection'
import { BasicBlock } from '../interfaces/Block'

export interface MangoResponse<D> {
  docs: D[]
}

export enum DocumentType {
  Page = 'PAGE',
  Block = 'BLOCK',
  Selection = 'SELECTION',
  BlockRelation = 'BLOCK_RELATION',
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

export interface DbPage extends PageHeader {
  blocks: BasicBlock[]
  selection: string
  publicAccountId?: string
  documentType: DocumentType.Page
}
