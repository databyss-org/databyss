export interface Document {
  _id: string
  sharedWithGroups?: string[]
  belongsToGroup?: string
}

export interface DocumentDict<T extends Document> {
  [id: string]: T
}
