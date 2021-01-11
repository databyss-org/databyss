import { DocumentType } from '@databyss-org/data/database/interfaces'
import { Block, Selection } from './'

export interface PageHeader {
  _id: string
  name: string
  archive: boolean
  $type?: DocumentType
}

export interface Page extends PageHeader {
  blocks: Block[]
  selection: Selection
  publicAccountId?: string
}

// export interface PageConstructor extends Page
