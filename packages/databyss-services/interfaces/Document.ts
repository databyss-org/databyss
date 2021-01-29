export interface Document {
  _id: string
}

export interface DocumentDict<T extends Document> {
  [id: string]: T
}
