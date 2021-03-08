export interface Document {
  _id: string
  successorOf?: string[]
}

export interface DocumentDict<T extends Document> {
  [id: string]: T
}
