import { Point } from './'
import { DocumentType } from '../database/interfaces'

export interface Selection {
  anchor: Point
  focus: Point
  _id?: string
  documentType: DocumentType
}
