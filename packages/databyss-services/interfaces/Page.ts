import { Block, Selection } from './'
import { DocumentType } from '../database/interfaces'

export interface PageHeader {
  _id: string
  name: string
  archive: boolean
  documentType?: DocumentType
  // selection: string | Selection
}

export interface Page extends PageHeader {
  blocks: Block[]
  selection: Selection
  publicAccountId?: string
}
