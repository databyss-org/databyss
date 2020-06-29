import { Block } from './block'

export interface Page {
  name: string
  archive: boolean
  blocks: Block[]
}
