import { BlockRelation } from '@databyss-org/services/interfaces'
import { BlockType } from '../../databyss-services/interfaces/Block'

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

export type BlockRelationPayload = {
  _id: string
  page: string
  operationType: BlockRelationOperation
}

export type BlockRelationResponse = {
  _id: string
  pages: string[]
}

export type PagePath = {
  path: string[]
  blockRelations: BlockRelation[]
}
