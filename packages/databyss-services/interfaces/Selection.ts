import { uid } from '@databyss-org/data/lib/uid'
import { Point } from './'

export class Selection {
  anchor: Point
  focus: Point
  _id: string

  constructor() {
    this._id = uid()
    this.anchor = new Point()
    this.focus = new Point()
  }
}
