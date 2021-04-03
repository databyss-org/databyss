import { uidlc } from '@databyss-org/data/lib/uid'

export class Group {
  _id: string
  name?: string
  default?: boolean
  pages: string[]
  public?: boolean

  constructor(name: string) {
    this._id = `g_${uidlc()}`
    this.name = name
    this.pages = []
    this.public = false
  }
}
