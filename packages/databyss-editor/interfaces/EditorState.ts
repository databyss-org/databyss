import { Text, PageHeader } from '@databyss-org/services/interfaces'
import { Block, Selection } from './'
import { BlockReference } from '../../databyss-services/interfaces'

export interface PayloadOperation {
  index: number
  text: Text
  isRefEntity?: string
  withRerender?: string
  checkAtomicDelta?: boolean
  withBakeAtomic?: boolean
  convertInlineToAtomic?: boolean
}

export interface BackflowOperation {
  index: number
  block: Block
  insertBefore?: Boolean
  setSelection?: Boolean
  reloadAll?: Boolean
}

export interface EditorState {
  preventDefault?: boolean
  showMenuActions?: boolean
  showFormatMenu?: boolean
  showNewBlockMenu?: boolean
  operations: BackflowOperation[] & { reloadAll?: boolean }
  selection: Selection
  newEntities: Array<BlockReference | Block>
  removedEntities: BlockReference[]
  blocks: Block[]
  pageHeader?: PageHeader
  /**
   * Dictionary
   * - keys are entity names (e.g. topic or source text)
   * - values are blocks
   */
  entitySuggestionCache: { [text: string]: Block }
}
