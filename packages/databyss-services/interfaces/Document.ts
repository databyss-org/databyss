export interface Document {
  _id: string
  sharedWithGroups?: string[]
  belongsToGroup?: string
  lastSequence?: number
}

export interface DocumentDict<T extends Document> {
  [id: string]: T
}
