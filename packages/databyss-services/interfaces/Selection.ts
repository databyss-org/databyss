import { DocumentType } from '@databyss-org/data/database/interfaces'
import { Point } from './'

export interface Selection {
  anchor: Point
  focus: Point
  _id: string
  $type: DocumentType
}
