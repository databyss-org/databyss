import { Point } from './'
import { DocumentType } from './Block'

export interface Selection {
  anchor: Point
  focus: Point
  _id: string
  $type: DocumentType
}
