export interface Document {
  _id: string
  groups: string[]
}

export interface DocumentDict<T extends Document> {
  [id: string]: T
}
