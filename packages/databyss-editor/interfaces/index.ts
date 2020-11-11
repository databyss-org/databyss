import { Text } from '@databyss-org/services/interfaces'
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

export type BlockRelation = {
  block: string
  relatedBlock: string
  blockText?: Text
  relationshipType?: string
  relatedBlockType?: string
  page?: string
  blockIndex?: number
  removeBlock?: boolean
}

export type PagePath = {
  path: string[]
  blockRelations: BlockRelation[]
}
