import { PageHeader } from '../interfaces/Page'
import { BasicBlock } from '../interfaces/Block'

// TODO: call this PageDoc
export interface DbPage extends PageHeader {
  blocks: BasicBlock[]
  selection: string
  // $type: DocumentType.Page
}
