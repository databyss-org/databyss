import { CacheDict, ResourceResponse, PageHeader, Text } from './'

export interface GroupHeader {
  _id: string
  name: string
  default: boolean
}

export class Group implements GroupHeader {
  _id: string
  name: string
  default: boolean
  description: Text
  pages: PageHeader[]

  constructor() {
    this._id = 'NEW_GROUP' // TODO: replace with uid() unique id gen
    this.default = false
    this.name = 'untitled'
    this.description = new Text()
    this.pages = []
  }
}

export class GroupState {
  cache: CacheDict<Group>
  headerCache: ResourceResponse<CacheDict<Group>>

  constructor() {
    this.cache = {}
    this.headerCache = null
  }
}
