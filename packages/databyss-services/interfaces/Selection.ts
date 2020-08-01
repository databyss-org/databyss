import { Point } from './'

export interface Selection {
  anchor: Point
  focus: Point
  _id?: string
}
