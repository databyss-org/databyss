import { PageHeader } from '../interfaces/Page'
import { BasicBlock, DocumentType } from '../interfaces/Block'

export interface MangoResponse<D> {
  docs: D[]
}

export interface DbPage extends PageHeader {
  blocks: BasicBlock[]
  selection: string
  documentType: DocumentType.Page
}
