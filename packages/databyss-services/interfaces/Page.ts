import { Block, Selection } from './'

export interface PageHeader {
  _id: string
  name: string
  archive?: boolean
}

export interface Page extends PageHeader {
  blocks: Block[]
  selection: Selection
  publicAccountId?: string
}
