import { IndexPageResult } from '@databyss-org/services/interfaces'

export type {
  EditorState,
  PayloadOperation,
  BackflowOperation,
} from './EditorState'
export type {
  Range,
  Selection,
  Point,
  Text,
  BlockRelation,
  IndexPageResult,
} from '@databyss-org/services/interfaces'
export { BlockType, Block } from '@databyss-org/services/interfaces'

export enum BlockRelationOperation {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export type PagePath = {
  path: string[]
  blockRelations: IndexPageResult[]
}
