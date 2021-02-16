import { IndexPageResult } from '@databyss-org/services/interfaces'
import { BlockType } from '@databyss-org/services/interfaces/Block'

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

export enum BlockRelationOperation {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export type BlockRelation = {
  _id: string
  type: BlockType
  pages: string[]
}

export type PagePath = {
  path: string[]
  blockRelations: IndexPageResult[]
}
