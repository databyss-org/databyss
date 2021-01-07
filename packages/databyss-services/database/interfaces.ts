import { PageHeader } from '../interfaces/Page'
import { BasicBlock } from '../interfaces/Block'

export interface PageDoc extends PageHeader {
  blocks: BasicBlock[]
  selection: string
}
