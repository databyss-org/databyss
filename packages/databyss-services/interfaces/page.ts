import { Block } from './Block'

export interface PageHeader {
  _id: string
  name: string
  archive: boolean
}

export interface Page extends PageHeader {
  blocks: Block[]
}
