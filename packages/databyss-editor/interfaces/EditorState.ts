import { Text, PageHeader } from '@databyss-org/services/interfaces'
import { Block, Selection } from './'

export interface PayloadOperation {
  index: number
  text: Text
  isRefEntity?: string
  withRerender?: string
  withBakeAtomic?: boolean
  convertInlineToAtomic?: boolean
}

export interface BackflowOperation {
  index: number
  block: Block
  insertBefore?: Boolean
}

export interface EditorState {
  preventDefault?: boolean
  showMenuActions?: boolean
  showFormatMenu?: boolean
  showNewBlockMenu?: boolean
  operations: BackflowOperation[]
  selection: Selection
  newEntities: Block[]
  blocks: Block[]
  pageHeader?: PageHeader
  /**
   * Dictionary
   * - keys are entity names (e.g. topic or source text)
   * - values are blocks
   */
  entitySuggestionCache: { [text: string]: Block }
}
