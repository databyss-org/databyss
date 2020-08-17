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
  blockId: string
  relatedBlockId: string
  blockText: Text
  relatedTo: {
    _id: string
    relationshipType: string
    blockType: string
    pageId: string
    blockIndex: number
  }
}

export type PagePath = {
  path: string[]
  blockRelations: BlockRelation[]
}
