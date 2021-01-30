import { Range } from './Range'

export class Text {
  textValue: string
  ranges: Array<Range>

  constructor() {
    this.textValue = ''
    this.ranges = []
  }
}
