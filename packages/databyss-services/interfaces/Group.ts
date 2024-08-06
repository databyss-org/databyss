import { uidlc } from '@databyss-org/data/lib/uid'
import { Notification } from '@databyss-org/data/pouchdb/interfaces'
import { Text } from './Text'

export class Group {
  _id: string
  name: string
  default?: boolean
  pages: string[]
  public?: boolean
  defaultPageId?: string
  notifications?: Partial<Notification>[]
  localGroup?: boolean
  lastPublishedAt: string | null
  isPublishing: boolean
  publishingStatusId: string | null
  subtitle: Text
  publishSourceMedia?: boolean

  constructor(name: string) {
    this._id = `g_${uidlc()}`
    this.name = name
    this.pages = []
    this.public = false
    this.localGroup = false
    this.lastPublishedAt = null
    this.isPublishing = false
    this.publishingStatusId = null
    this.subtitle = { textValue: '', ranges: [] }
    this.publishSourceMedia = false
  }
}
