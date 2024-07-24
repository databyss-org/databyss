import { Text, PageHeader, Embed } from '@databyss-org/services/interfaces'
import { Block, Selection } from './'
import { BlockReference, BlockType } from '../../databyss-services/interfaces'
import { IframeAttributes } from '../components/Suggest/iframeUtils'

export interface PayloadOperation {
  index: number
  text: Text
  isRefEntity?: {
    _id: string
    type: BlockType
    shortName?: Text
  }
  withRerender?: string
  checkAtomicDelta?: boolean
  withBakeAtomic?: boolean
  convertInlineToAtomic?: boolean
  convertInlineToEmbed?: IframeAttributes & Embed
  fromSync?: boolean
}

export interface BackflowOperation {
  index: number
  block: Block
  insertBefore?: Boolean
  setSelection?: Boolean
  reloadAll?: Boolean
  // embed media requires cursor to move forward
  setCaretAfter?: Boolean
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
  changedEntities: BlockReference[]
  blocks: Block[]
  pageHeader?: PageHeader
  firstBlockIsTitle?: boolean
  /**
   * Dictionary
   * - keys are entity names (e.g. topic or source text)
   * - values are blocks
   */
  entitySuggestionCache: { [text: string]: Block }
}
