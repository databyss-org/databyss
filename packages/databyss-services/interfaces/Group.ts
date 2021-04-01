import { uidlc } from '@databyss-org/data/lib/uid'
import { Notification } from '@databyss-org/data/pouchdb/interfaces'

export class Group {
  _id: string
  name?: string
  default?: boolean
  pages: string[]
  public?: boolean
  defaultPageId?: string
  notifications?: Partial<Notification>[]

  constructor(name: string) {
    this._id = uidlc()
    this.name = name
    this.pages = []
    this.public = false
  }
}
