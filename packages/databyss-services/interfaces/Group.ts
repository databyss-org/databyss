import { CacheDict, ResourceResponse, PageHeader, Text } from './'

export interface GroupHeader {
  _id: string
  name: string
  default: boolean
  public: boolean
}

export class Group implements GroupHeader {
  _id: string
  name: string
  default: boolean
  description: Text
  pages: PageHeader[]
  public: boolean

  constructor() {
    this._id = 'NEW_GROUP' // TODO: replace with uid() unique id gen
    this.default = false
    this.name = 'untitled'
    this.description = new Text()
    this.pages = []
    this.public = false
  }
}

export class GroupState {
  cache: CacheDict<Group>
  headerCache: ResourceResponse<CacheDict<GroupHeader>>
  sharedPageHeaderCache: ResourceResponse<CacheDict<PageHeader>>

  constructor() {
    this.cache = {}
    this.headerCache = null
    this.sharedPageHeaderCache = null
  }
}
