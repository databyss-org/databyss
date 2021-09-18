export interface Document {
  _id: string
  sharedWithGroups?: string[]
  belongsToGroup?: string
  lastSequence?: number
  modifiedAt?: number
  createdAt?: number
}

export interface DocumentDict<T extends Document> {
  [id: string]: T
}
