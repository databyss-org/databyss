import { Block, Selection } from './'
import { DocumentType } from './Block'

export interface PageHeader {
  _id: string
  name: string
  archive: boolean
  documentType?: DocumentType
}

export interface Page extends PageHeader {
  blocks: Block[]
  selection: Selection
  publicAccountId?: string
}

export interface PageConstructor extends Page