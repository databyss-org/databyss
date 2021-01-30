import { BlockRelation } from '@databyss-org/services/interfaces'

export type {
  EditorState,
  PayloadOperation,
  BackflowOperation,
} from './EditorState'
export type {
  Range,
  Block,
  Selection,
  Point,
  Text,
} from '@databyss-org/services/interfaces'
export { BlockType } from '@databyss-org/services/interfaces'

export type BlockRelationPayload = {
  blocksRelationArray?: BlockRelation[]
  clearPageRelationships?: string
}

export type PagePath = {
  path: string[]
  blockRelations: BlockRelation[]
}
