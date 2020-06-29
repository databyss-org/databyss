import { Point } from './point'

export interface Selection {
  anchor: Point
  focus: Point
  _id: string | null
}
