import { PageHeader } from '@databyss-org/services/interfaces/Page'
import { BasicBlock } from '@databyss-org/services/interfaces/Block'

export interface PageDoc extends PageHeader {
  blocks: BasicBlock[]
  selection: string
}
